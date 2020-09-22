const Sequelize = require('sequelize');

module.exports = class Room extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        name: { type: DataTypes.STRING(30), allowNull: false },
        roomImage: { type: DataTypes.STRING(100), allowNull: true },
        isOneOnOne: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
        oneOnOneTarget: { type: DataTypes.STRING(10), defaultValue: null, allowNull: true },
      },
      { sequelize, modelName: 'Room', tableName: 'rooms' }
    );
  }
  static associate(models) {
    this.belongsTo(models.User);
    this.belongsToMany(models.User, {
      as: 'Users',
      through: 'UsersRooms',
      foreignKey: 'RoomId',
    });
    this.hasMany(models.Chat);
  }
};
