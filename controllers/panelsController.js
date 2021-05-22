const ServerUsersModel = require('../models/serverUsers');
const ServerModel = require('../models/server');

const axios = require('axios');

exports.panels_get = async function(req, res) {
    try {
        if (!req.session.isAuthorized || req.session.isAdmin) {
            throw new Error('Permissions error');
        }

        let server = await ServerModel.findByPk(parseInt(req.params.id));
        if (server === null){
            throw new Error('Server not found');
        }

        let response = await axios.get(`http://${server.address}:${server.port}/device/points`)

        res.render('panels/panel', {req, server, points: response.data});
    } catch (e) {
        res.end(e.message);
    }
}

exports.index_get = async function(req, res) {
    try {
        if (!req.session.isAuthorized) {
            throw new Error('Persmissions error');
        }

        let serverUsers = await ServerUsersModel.findAll({
            where: {
                userId: req.session.userId
            },
            include: [
                ServerModel
            ]
        });

        let displayServers = []
        for (let serverUser of serverUsers) {

            let currentServer = serverUser.Server;
            displayServers.push({
                name: currentServer.name,
                address: currentServer.address,
                port: currentServer.port,
                id: currentServer.id
            });
        }

        res.render('panels/index', {req: req, servers: displayServers});
    } catch (e) {
        res.end(e.message);
    }
}

exports.api_state_get = async function(req, res) {
    try {
        if (!req.session.isAuthorized) {
            throw new Error('Not authorized');
        }

        let serverId = parseInt(req.params.id);

        let serverUser = await ServerUsersModel.findOne({
            where: {
                userId: req.session.userId,
                serverId: serverId
            },
        });

        if (serverUser === null) {
            throw new Error('You are not allowed to control this server');
        }

        let server = await ServerModel.findByPk(parseInt(req.params.id));
        if (server === null){
            throw new Error('Server not found');
        }

        let response = await axios.get(`http://${server.address}:${server.port}/device/state`)

        res.status(200).json(response.data);
    } catch (e) {
        res.status(400).json({error: e.message});
    }
}

exports.api_state_post = async function(req, res) {
    try {
        if (!req.session.isAuthorized) {
            throw new Error('Not authorized');
        }

        let serverId = parseInt(req.params.id);

        let serverUser = await ServerUsersModel.findOne({
            where: {
                userId: req.session.userId,
                serverId: serverId
            },
        });

        let slaveId = req.params.slaveId;
        let state = req.params.state;

        if (serverUser === null) {
            throw new Error('You are not allowed to control this server');
        }

        let server = await ServerModel.findByPk(parseInt(req.params.id));
        if (server === null){
            throw new Error('Server not found');
        }

        let response = await axios.post(`http://${server.address}:${server.port}/device/state/${slaveId}/${state}`);

        res.status(200).json(response.data);
    } catch (e) {
        res.status(400).json({error: e.message});
    }
}