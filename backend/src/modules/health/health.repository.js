import HealthData from './health.model.js';
import { Op } from 'sequelize';

export const saveHealthData = async (userId, data) => {
    return await HealthData.create({
        userId,
        heartRate: data.heartRate !== undefined ? data.heartRate : null,
        oxygenLevel: data.oxygenLevel !== undefined ? data.oxygenLevel : null,
        steps: data.steps !== undefined ? data.steps : 0,
        calories: data.calories !== undefined ? data.calories : 0,
        exerciseMins: data.exerciseMins !== undefined ? data.exerciseMins : 0,
        walkingHours: data.walkingHours !== undefined ? data.walkingHours : 0,
        battery: data.battery !== undefined ? data.battery : 100,
        sleepDuration: data.sleepDuration || null,
        statusText: data.statusText || null,
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
