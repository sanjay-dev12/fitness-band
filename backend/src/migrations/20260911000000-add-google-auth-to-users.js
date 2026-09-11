import { DataTypes } from 'sequelize';

export async function up(queryInterface, Sequelize) {
  const tableInfo = await queryInterface.describeTable('Users');

  if (!tableInfo.googleId) {
    await queryInterface.addColumn('Users', 'googleId', {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    });
  }

  if (!tableInfo.authProvider) {
    await queryInterface.addColumn('Users', 'authProvider', {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'local',
    });
  }

  if (tableInfo.password && !tableInfo.password.allowNull) {
    await queryInterface.changeColumn('Users', 'password', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  }
}

export async function down(queryInterface, Sequelize) {
  const tableInfo = await queryInterface.describeTable('Users');

  if (tableInfo.googleId) {
    await queryInterface.removeColumn('Users', 'googleId');
  }

  if (tableInfo.authProvider) {
    await queryInterface.removeColumn('Users', 'authProvider');
  }

  if (tableInfo.password) {
    await queryInterface.changeColumn('Users', 'password', {
      type: DataTypes.STRING,
      allowNull: false,
    });
  }
}
