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
