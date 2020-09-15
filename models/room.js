const Sequelize = require('sequelize');

module.exports = class Room extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        name: { type: DataTypes.STRING(30), allowNull: false },
        roomImage: { type: DataTypes.STRING(100), allowNull: true },
      },
      { sequelize, modelName: 'Room', tableName: 'rooms' }
    );
  }
  static associate(models) {
    this.belongsToMany(models.User, {
      as: 'Users',
      through: 'UsersRooms',
      foreignKey: 'RoomId',
    });
  }
};
