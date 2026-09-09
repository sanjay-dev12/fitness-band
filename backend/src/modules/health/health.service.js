import { saveHealthData, getHealthHistory, getLatestHealth } from './health.repository.js';
import { findConnection } from '../family/family.repository.js';

export const syncHealth = async (userId, healthData) => {
    return await saveHealthData(userId, healthData);
};

export const getMyHealth = async (userId, days) => {
    return await getHealthHistory(userId, days);
};

export const getMyLatestHealth = async (userId) => {
    return await getLatestHealth(userId);
};

export const getFamilyMemberHealth = async (currentUserId, memberId) => {
    // Check if they are in the same family circle
    const isParent = await findConnection(currentUserId, memberId);
    const isChild = await findConnection(memberId, currentUserId);

    if (!isParent && !isChild) {
        const error = new Error("Not authorized to view this user's health data");
        error.statusCode = 403;
        throw error;
    }

    const connection = isParent || isChild;
    if (connection.status !== 'accepted') {
         const error = new Error("Connection is not accepted yet");
         error.statusCode = 403;
         throw error;
    }

    return await getLatestHealth(memberId);
};
