const Sequelize = require('sequelize');
module.exports = class User extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        email: { type: DataTypes.STRING(30), unique: true, allowNull: false },
        nickname: { type: DataTypes.STRING(30), allowNull: false },
        password: { type: DataTypes.STRING(100), allowNull: false },
        statusMessage: { type: DataTypes.STRING(50), allowNull: false },
        profileImage: { type: DataTypes.STRING(100), allowNull: false },
      },
      { sequelize, modelName: 'User', tableName: 'users' }
    );
  }
  static associate(models) {
    this.belongsToMany(models.User, {
      as: 'Friends',
      through: 'Friend',
      foreignKey: 'UserId',
    });
    this.belongsToMany(models.User, {
      as: 'Users',
      through: 'Friend',
      foreignKey: 'FriendId',
    });
  }
};