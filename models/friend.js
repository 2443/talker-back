const Sequelize = require('sequelize');
module.exports = class Friend extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        UserId: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        FriendId: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        state: {
          allowNull: false,
          type: DataTypes.STRING(10),
        },
      },
      { sequelize, modelName: 'Friend', tableName: 'friends' }
    );
  }
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'UserId',
    });
    this.belongsTo(models.User, {
      foreignKey: 'FriendId',
    });
  }
};
