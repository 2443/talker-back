const Sequelize = require('sequelize');
module.exports = class Room extends Sequelize.Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        myField: DataTypes.STRING,
      },
      { sequelize, modelName: 'Room', tableName: 'rooms' }
    );
  }
  static associate(models) {
    this.belongsTo(models.User);
  }
};
