import crypto from 'crypto';
import {
    createFamilyConnection,
    createFamilyInviteRecord,
    findInviteByCode,
    findConnection,
    getConnectionsForUser,
} from './family.repository.js';
import { findUserByIdentifier } from '../user/user.repository.js';
import User from '../user/user.model.js';
import HealthData from '../health/health.model.js';

// Helper to generate a random unique invitation code HB-XXXXX
const generateRandomCode = () => {
    const randomChars = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 5);
    return `HB-${randomChars}`;
};

export const createFamily = async (parentId, familyName) => {
    const finalFamilyName = familyName?.trim() || 'Family Circle';
    
    // Generate a random unique code
    let inviteCode = generateRandomCode();
    let existing = await findInviteByCode(inviteCode);
    
    // Ensure uniqueness
    while (existing) {
        inviteCode = generateRandomCode();
        existing = await findInviteByCode(inviteCode);
    }

    const record = await createFamilyInviteRecord(parentId, finalFamilyName, inviteCode);
    return {
        id: record.id,
        familyName: record.familyName,
        inviteCode: record.inviteCode,
        status: record.status,
    };
};

export const joinFamilyByCode = async (childId, rawInviteCode) => {
    if (!rawInviteCode || !rawInviteCode.trim()) {
        const err = new Error('Invitation code is required.');
        err.statusCode = 400;
        throw err;
    }

    const inviteCode = rawInviteCode.trim().toUpperCase();
    const record = await findInviteByCode(inviteCode);

    if (!record) {
        const err = new Error('Invalid invitation code. Please check and try again.');
        err.statusCode = 404;
        throw err;
    }

    if (record.parentId === childId) {
        const err = new Error('You cannot join your own family circle invitation.');
        err.statusCode = 400;
        throw err;
    }

    // Connect child user to parent's family invitation
    record.childId = childId;
    record.status = 'accepted';
    await record.save();

    const parentUser = await User.findByPk(record.parentId, {
        attributes: ['id', 'fullName', 'identifier', 'accountType'],
    });

    return {
        id: record.id,
        familyName: record.familyName,
        inviteCode: record.inviteCode,
        status: record.status,
        parent: parentUser,
    };
};

export const inviteMember = async (currentUserId, inviteeIdentifier) => {
    const invitee = await findUserByIdentifier(inviteeIdentifier);
    if (!invitee) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    if (invitee.id === currentUserId) {
        const err = new Error('Cannot invite yourself');
        err.statusCode = 400;
        throw err;
    }

    const existing = await findConnection(currentUserId, invitee.id);
    if (existing) {
        const err = new Error('Connection already exists or is pending');
        err.statusCode = 400;
        throw err;
    }

    const connection = await createFamilyConnection(currentUserId, invitee.id);
    return connection;
};

export const getMyFamily = async (userId) => {
    const connections = await getConnectionsForUser(userId);
    
    // For each connection, attach latest health data for the family member
    const enhanced = await Promise.all(connections.map(async (c) => {
        const plain = c.toJSON ? c.toJSON() : c;
        const otherUserId = plain.parentId === userId ? plain.childId : plain.parentId;
        let latestHealth = null;
        if (otherUserId) {
            latestHealth = await HealthData.findOne({
                where: { userId: otherUserId },
                order: [['recordedAt', 'DESC']]
            });
        }
        return {
            ...plain,
            latestHealth: latestHealth ? (latestHealth.toJSON ? latestHealth.toJSON() : latestHealth) : null
        };
    }));

    return enhanced;
};
