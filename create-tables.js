const user = require('./models/user');
const server = require('./models/server');
const serverUsers = require('./models/serverUsers');

user.sync();
server.sync();
serverUsers.sync();