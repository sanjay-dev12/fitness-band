import FamilyCircle from './family.model.js';
import User from '../user/user.model.js';
import { Op } from 'sequelize';

export const createFamilyConnection = async (parentId, childId) => {
    return await FamilyCircle.create({ parentId, childId, status: 'pending' });
};

export const createFamilyInviteRecord = async (parentId, familyName, inviteCode) => {
    return await FamilyCircle.create({
        parentId,
        familyName,
        inviteCode,
        status: 'pending',
    });
};

export const findInviteByCode = async (inviteCode) => {
    return await FamilyCircle.findOne({
        where: {
            inviteCode: inviteCode.trim().toUpperCase(),
        },
    });
};

export const findConnection = async (parentId, childId) => {
    return await FamilyCircle.findOne({ where: { parentId, childId } });
};

export const updateConnectionStatus = async (id, status) => {
    return await FamilyCircle.update({ status }, { where: { id } });
};

export const getConnectionsForUser = async (userId) => {
    return await FamilyCircle.findAll({
        where: {
            [Op.or]: [
                { parentId: userId },
                { childId: userId }
            ]
        },
        include: [
            { model: User, as: 'parent', attributes: ['id', 'fullName', 'accountType', 'identifier'] },
            { model: User, as: 'child', attributes: ['id', 'fullName', 'accountType', 'identifier'] }
        ]
    });
};
