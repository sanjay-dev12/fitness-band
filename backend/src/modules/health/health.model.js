import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const HealthData = sequelize.define('HealthData', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    heartRate: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    oxygenLevel: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    steps: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    calories: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    exerciseMins: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    walkingHours: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    battery: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 100,
    },
    sleepDuration: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    deepSleepMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    lightSleepMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    remSleepMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    awakeSleepMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sleepStartTime: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    sleepEndTime: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    distance: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    hrv: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    restingHeartRate: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    stress: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    workoutType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    workoutDuration: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    source: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Health Connect',
    },
    sourceRecordId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    syncedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    rawSamples: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    statusText: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    recordedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    timestamps: true,
});

export default HealthData;
