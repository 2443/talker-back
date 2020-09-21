const Sequelize = require('sequelize');
module.exports = class Chat extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        content: DataTypes.STRING,
        type: DataTypes.STRING,
      },
      { sequelize, modelName: 'Chat', tableName: 'chats' }
    );
  }
  static associate(models) {
    this.belongsTo(models.Room);
    this.belongsTo(models.User);
  }
};
