const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const RoomModel = require('./room');
const UserModel = require('./user');
const FriendModel = require('./friend');

const models = {
  Room: RoomModel.init(sequelize, Sequelize),
  User: UserModel.init(sequelize, Sequelize),
  Friend: FriendModel.init(sequelize, Sequelize),
};

// Run `.associate` if it exists,
// ie create relationships in the ORM
Object.values(models)
  .filter((model) => typeof model.associate === 'function')
  .forEach((model) => model.associate(models));

const db = {
  ...models,
  sequelize,
};

module.exports = db;
