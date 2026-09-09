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
    recordedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    timestamps: true,
});

export default HealthData;
