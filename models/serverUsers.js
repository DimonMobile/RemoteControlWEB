const UserModel = require('./user');
const ServerModel = require('./server');

const { Sequelize, DataTypes, UniqueConstraintError } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

const ServerUsers = sequelize.define('ServerUsers', {
}, {
    timestamps: false,
    indexes: [{
        unique: true,
        fields: ['UserId', 'ServerId']
    }]
});

ServerUsers.belongsTo(UserModel, {onDelete: 'cascade'});
ServerUsers.belongsTo(ServerModel, {onDelete: 'cascade'});

module.exports = ServerUsers;