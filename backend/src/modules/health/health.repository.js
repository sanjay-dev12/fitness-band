import HealthData from './health.model.js';
import { Op } from 'sequelize';

export const saveHealthData = async (userId, data) => {
    const recordedAt = data.timestamp ? new Date(data.timestamp) : new Date();
    const source = data.source || 'Bluetooth Band';
    const sourceRecordId = data.sourceRecordId || null;

    // Duplicate prevention: check for existing record with same sourceRecordId
    // or within a 2-minute window on the same date with the same source
    let existingRecord = null;
    if (sourceRecordId) {
        existingRecord = await HealthData.findOne({
            where: { userId, sourceRecordId }
        });
    }

    if (!existingRecord && data.timestamp) {
        const twoMinsBefore = new Date(recordedAt.getTime() - 2 * 60 * 1000);
        const twoMinsAfter = new Date(recordedAt.getTime() + 2 * 60 * 1000);

        existingRecord = await HealthData.findOne({
            where: {
                userId,
                source,
                recordedAt: {
                    [Op.between]: [twoMinsBefore, twoMinsAfter]
                }
            }
        });
    }

    const payload = {
        userId,
        heartRate: data.heartRate !== undefined ? data.heartRate : null,
        restingHeartRate: data.restingHeartRate !== undefined ? data.restingHeartRate : null,
        oxygenLevel: data.oxygenLevel !== undefined ? data.oxygenLevel : (data.oxygen !== undefined ? data.oxygen : null),
        steps: data.steps !== undefined ? data.steps : 0,
        calories: data.calories !== undefined ? data.calories : 0,
        distance: data.distance !== undefined ? data.distance : null,
        exerciseMins: data.exerciseMins !== undefined ? data.exerciseMins : 0,
        walkingHours: data.walkingHours !== undefined ? data.walkingHours : 0,
        battery: data.battery !== undefined ? data.battery : 100,
        sleepDuration: data.sleepDuration || null,
        deepSleepMinutes: data.deepSleepMinutes !== undefined ? data.deepSleepMinutes : null,
        lightSleepMinutes: data.lightSleepMinutes !== undefined ? data.lightSleepMinutes : null,
        remSleepMinutes: data.remSleepMinutes !== undefined ? data.remSleepMinutes : null,
        awakeSleepMinutes: data.awakeSleepMinutes !== undefined ? data.awakeSleepMinutes : null,
        sleepStartTime: data.sleepStartTime ? new Date(data.sleepStartTime) : null,
        sleepEndTime: data.sleepEndTime ? new Date(data.sleepEndTime) : null,
        hrv: data.hrv !== undefined ? data.hrv : null,
        stress: data.stress !== undefined ? data.stress : null,
        workoutType: data.workoutType || null,
        workoutDuration: data.workoutDuration !== undefined ? data.workoutDuration : null,
        source,
        sourceRecordId,
        syncedAt: new Date(),
        rawSamples: data.rawSamples || null,
        statusText: data.statusText || 'Synchronized',
        bluetoothConnected: data.bluetoothConnected !== undefined ? Boolean(data.bluetoothConnected) : true,
        bluetoothDisconnectedAt: data.bluetoothDisconnectedAt ? new Date(data.bluetoothDisconnectedAt) : null,
        recordedAt
    };

    if (existingRecord) {
        await existingRecord.update(payload);
        return existingRecord;
    }

    return await HealthData.create(payload);
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

export const getHealthSummary = async (userId, days = 7) => {
    const history = await getHealthHistory(userId, days);
    const latest = await getLatestHealth(userId);

    let totalSteps = 0;
    let totalCalories = 0;
    let totalDistance = 0;
    let hrSum = 0;
    let hrCount = 0;
    let maxHr = 0;
    let minHr = 999;

    history.forEach(item => {
        if (item.steps) totalSteps += item.steps;
        if (item.calories) totalCalories += item.calories;
        if (item.distance) totalDistance += item.distance;
        if (item.heartRate) {
            hrSum += item.heartRate;
            hrCount += 1;
            if (item.heartRate > maxHr) maxHr = item.heartRate;
            if (item.heartRate < minHr) minHr = item.heartRate;
        }
    });

    return {
        latest,
        summary: {
            totalSteps,
            totalCalories,
            totalDistance: Math.round(totalDistance * 100) / 100,
            avgHeartRate: hrCount > 0 ? Math.round(hrSum / hrCount) : null,
            maxHeartRate: hrCount > 0 ? maxHr : null,
            minHeartRate: hrCount > 0 ? minHr : null,
            recordsCount: history.length,
            days
        }
    };
};

export const updateBluetoothState = async (userId, isConnected, currentData = null) => {
    let latest = await HealthData.findOne({
        where: { userId },
        order: [['recordedAt', 'DESC']]
    });

    if (!latest) {
        return await HealthData.create({
            userId,
            bluetoothConnected: isConnected,
            bluetoothDisconnectedAt: isConnected ? null : new Date(),
            syncedAt: new Date(),
            recordedAt: new Date(),
            statusText: isConnected ? 'Connected via Bluetooth' : 'Bluetooth Disconnected'
        });
    }

    const updates = {
        bluetoothConnected: isConnected,
        bluetoothDisconnectedAt: isConnected ? null : new Date(),
        statusText: isConnected ? 'Connected via Bluetooth' : 'Bluetooth Disconnected • Telemetry Paused',
    };

    // If we have accumulated/corrected metrics up to this moment, preserve them in DB
    if (currentData) {
        if (currentData.steps !== undefined) updates.steps = currentData.steps;
        if (currentData.calories !== undefined) updates.calories = currentData.calories;
        if (currentData.distance !== undefined) updates.distance = currentData.distance;
        if (currentData.exerciseMins !== undefined) updates.exerciseMins = currentData.exerciseMins;
        if (currentData.walkingHours !== undefined) updates.walkingHours = currentData.walkingHours;
        if (currentData.heartRate !== undefined) updates.heartRate = currentData.heartRate;
        if (currentData.battery !== undefined) updates.battery = currentData.battery;
    }

    if (isConnected) {
        updates.syncedAt = new Date();
    }

    await latest.update(updates);
    return latest;
};

