const ServerModel = require('../models/server');
const ServerUsersModel = require('../models/serverUsers');
const UserModel = require('../models/user');

const axios = require('axios');

exports.list_get = async function (req, res) {
    try {
        if (req.session.role !== 'admin') {
            throw new Error('Persmissions error');
        }

        let servers = await ServerModel.findAll();

        res.render('servers/list', { req: req, servers });
    } catch (e) {
        res.end(e.message);
    }
}

exports.list_post = async function (req, res) {
    try {
        if (req.session.role !== 'admin') {
            throw new Error('Persmissions error');
        }

        if (!(req.body.name && req.body.address && req.body.port)) {
            throw new Error('Not enough params');
        }

        await ServerModel.create({name: req.body.name, address: req.body.address, port: req.body.port});
        res.redirect('/servers/list');
    } catch (e) {
        res.end(e.message);
    }
}

exports.users_post = async function (req, res) {
    try {
        if (req.session.role !== 'admin') {
            throw new Error('Persmissions error');
        }

        let serverId = parseInt(req.params.id);
        let userId = parseInt(req.body.id);

        await ServerUsersModel.create({UserId: userId, ServerId: serverId});

        res.redirect(`/servers/users/${serverId}`);
    } catch (e) {
        res.end(e.message);
    }
}

exports.users_get = async function (req, res) {
    try {
        if (req.session.role !== 'admin') {
            throw new Error('Persmissions error');
        }

        let serverData = await ServerModel.findByPk(req.params.id);

        let links = await ServerUsersModel.findAll({where: {ServerId: req.params.id}, include: [UserModel]});
        let preparedUsers = [];
        for (let link of links) {
            preparedUsers.push({
                linkId: link.id,
                id: link.User.id,
                login: link.User.login
            });
        }

        let users = await UserModel.findAll();

        let usersList = [];

        for (let user of users) {
            usersList.push({
                id: user.id,
                login: user.login
            });
        }

        res.render('servers/users', {req, preparedUsers, usersList, serverData});

    } catch (e) {
        res.end(e.message);
    }
}

exports.status_get = async function (req, res) {
    try {
        if (req.session.role !== 'admin') {
            throw new Error('Persmissions error');
        }

        let serverId = parseInt(req.params.id);
        let server = await ServerModel.findByPk(serverId);
        if (server === null)
            throw new Error('Server not found');
        
        axios.get(`http://${server.address}:${server.port}/device/status`).then(response => {
            if (response.data.status === 'running') {
                res.status(200).contentType('application/json').end(JSON.stringify(response.data));
            }
        }).catch(e => {
            res.status(500).contentType('application/json').end(JSON.stringify({error: e.message}));
        });
    } catch (e) {
        res.status(400).end(JSON.stringify({error: e.message}));
    }
}

exports.configuration_post = async function(req, res) {
    try {
        if (req.session.role !== 'admin') {
            throw new Error('Permissions error');
        }

        let serverId = parseInt(req.params.id);
        let server = await ServerModel.findByPk(serverId);
        if (server === null)
            throw new Error('Server not found');

        let collectedData = '';
        req.on('data', async chunk => {
            collectedData += chunk;            
        });

        req.on('end', async () =>{
            let response = await axios.post(`http://${server.address}:${server.port}/device/points`, JSON.parse(collectedData));
            console.log(response.status);

            res.status(200).end();
        });

    } catch (e) {
        res.status(400).end(JSON.stringify({error: e.message}));
    }
}

exports.configuration_get = async function(req, res) {
    try {
        if (!req.session.isAuthorized) {
            throw new Error('Permissions error');
        }

        let serverId = parseInt(req.params.id);
        let server = await ServerModel.findByPk(serverId);
        if (server === null)
            throw new Error('Server not found');

        let response = await axios.get(`http://${server.address}:${server.port}/device/points`)

        res.render('servers/configure', {req, points: response.data, server});

    } catch (e) {
        res.status(400).end(JSON.stringify({error: e.message}));
    }
}

exports.action_deleteLink = async function (req, res) {
    try {
        if (req.session.role !== 'admin') {
            throw new Error('Persmissions error');
        }

        let linkId = parseInt(req.params.id);
        let serverId = parseInt(req.query.returnTo);

        let serverUser = await ServerUsersModel.findByPk(linkId);
        await serverUser.destroy();

        res.redirect(`/servers/users/${serverId}`);
    } catch (e) {
        res.end(e.message);
    }
}

exports.picture_post = async function(req, res) {
    try {
        if (req.session.role !== 'admin') {
            throw new Error('Permissions error');
        }

        let serverId = parseInt(req.params.id);

        let server = await ServerModel.findByPk(serverId);
        if (server === null) {
            throw new Error('Server not found');
        }

        let collected = []
        req.on('data', (chunk) => {
            collected.push(chunk);
        });
    
        req.on('end', async () => {
            let buffer = Buffer.concat(collected);

            await axios.post(`http://${server.address}:${server.port}/device/picture`, buffer, {
                headers: {
                    'Content-type': req.get('Content-type')
                }
            });
            
            res.status(200).end();
        });
        
    } catch (e) {
        res.end(e.message);
    }
}

exports.picture_get = async function(req, res) {
    try {
        if (!req.session.isAuthorized) {
            throw new Error('Permissions error');
        }

        let serverId = parseInt(req.params.id);

        let server = await ServerModel.findByPk(serverId);
        if (server === null) {
            throw new Error('Server not found');
        }
    
        let response = await axios.get(`http://${server.address}:${server.port}/device/picture`, {
            responseType: 'arraybuffer'
        });
        res.contentType(response.headers['content-type']);
        res.end(response.data);
    } catch (e) {
        res.end(e.message);
    }
}

exports.action_delete = async function (req, res) {
    try {
        if (req.session.role !== 'admin') {
            throw new Error('Persmissions error');
        }

        let serverId = parseInt(req.params.id);

        let server = await ServerModel.findByPk(serverId);
        await server.destroy();

        res.redirect('/servers/list');
    } catch (e) {
        res.end(e.message);
    }
}