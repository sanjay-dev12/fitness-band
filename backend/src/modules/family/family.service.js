import { createFamilyConnection, findConnection, getConnectionsForUser, updateConnectionStatus } from './family.repository.js';
import { findUserByIdentifier } from '../user/user.repository.js';

export const inviteMember = async (currentUserId, inviteeIdentifier) => {
    const invitee = await findUserByIdentifier(inviteeIdentifier);
    if (!invitee) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
    }

    if (invitee.id === currentUserId) {
        const err = new Error("Cannot invite yourself");
        err.statusCode = 400;
        throw err;
    }

    const existing = await findConnection(currentUserId, invitee.id);
    if (existing) {
        const err = new Error("Connection already exists or is pending");
        err.statusCode = 400;
        throw err;
    }

    const connection = await createFamilyConnection(currentUserId, invitee.id);
    return connection;
};

export const getMyFamily = async (userId) => {
    const connections = await getConnectionsForUser(userId);
    return connections;
};
