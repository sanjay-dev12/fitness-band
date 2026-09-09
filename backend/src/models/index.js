import sequelize from '../config/db.js';
import User from '../modules/user/user.model.js';
import HealthData from '../modules/health/health.model.js';
import FamilyCircle from '../modules/family/family.model.js';

// Define relationships
User.hasMany(HealthData, { foreignKey: 'userId' });
HealthData.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FamilyCircle, { foreignKey: 'parentId', as: 'parentConnections' });
User.hasMany(FamilyCircle, { foreignKey: 'childId', as: 'childConnections' });
FamilyCircle.belongsTo(User, { foreignKey: 'parentId', as: 'parent' });
FamilyCircle.belongsTo(User, { foreignKey: 'childId', as: 'child' });

const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("✓ Database synced successfully");
    } catch (error) {
        console.error("✗ Failed to sync database:", error.message);
    }
};

export {
    sequelize,
    User,
    HealthData,
    FamilyCircle,
    syncDatabase,
};
