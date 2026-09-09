import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const FamilyCircle = sequelize.define('FamilyCircle', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    parentId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    childId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
    },
    permissions: {
        type: DataTypes.JSON,
        defaultValue: {
            view_heart_rate: true,
            view_oxygen: true,
            view_steps: true,
            view_location: false,
        },
    }
}, {
    timestamps: true,
});

export default FamilyCircle;
