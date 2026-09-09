import HealthData from './health.model.js';
import { Op } from 'sequelize';

export const saveHealthData = async (userId, data) => {
    return await HealthData.create({
        userId,
        heartRate: data.heartRate,
        oxygenLevel: data.oxygenLevel,
        steps: data.steps,
        recordedAt: data.timestamp || new Date()
    });
};

export const getHealthHistory = async (userId, days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await HealthData.findAll({
        where: {
            userId,
            recordedAt: {
                [Op.gte]: startDate
            }
        },
        order: [['recordedAt', 'ASC']]
    });
};

export const getLatestHealth = async (userId) => {
    return await HealthData.findOne({
        where: { userId },
        order: [['recordedAt', 'DESC']]
    });
};
