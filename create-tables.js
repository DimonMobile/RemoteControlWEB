const user = require('./models/user');
const server = require('./models/server');

user.sync();
server.sync();