const Sequelize = require('sequelize');
module.exports = class Chat extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        content: {
          allowNull: false,
          type: DataTypes.STRING,
        },
        type: {
          allowNull: true,
          type: DataTypes.STRING(10),
        },
      },
      { sequelize, modelName: 'Chat', tableName: 'chats' }
    );
  }
  static associate(models) {
    this.belongsTo(models.Room);
    this.belongsTo(models.User);
  }
};
