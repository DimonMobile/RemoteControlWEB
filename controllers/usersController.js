const UserModel = require('../models/user');

const crypto = require("crypto");

const config = require('../config');
const e = require('express');
const { response } = require('express');

exports.authorize_get = function (req, res) {
    if (req.session.isAuthorized){
        res.redirect('/panels/');
    } else {
        res.render("users/authorize", {req: req});
    }
};

exports.authorize_post = async function (req, res) {
    let loginErrorText = null;
    let passwordErrorText = null;

    try {
        let userLogin = req.body.login.trim();
        let userPassword = req.body.password;

        if (userLogin === null || userLogin.length === 0) {
            loginErrorText = "User login required";
        }

        if (userPassword === null || userPassword.length === 0) {
            passwordErrorText = "User password required";
        }

        if (loginErrorText !== null || passwordErrorText !== null) {
            throw new Error('Empty credentials');
        }

        if (userLogin.length < 5 || userLogin.length > 32) {
            loginErrorText = 'Login length must be in range 5..32';
        }

        if (userPassword.length < 5 || userPassword.length > 64) {
            passwordErrorText = 'Password length must be in range 5..64';
        }

        if (loginErrorText !== null || passwordErrorText !== null) {
            throw new Error('Invalid input length');
        }

        if (userLogin === 'admin' && userPassword === config.ADMIN_PASSWORD) {
            req.session.isAuthorized = true;
            req.session.role = 'admin';
            req.session.isAdmin = true;
            req.session.userName = 'admin';
            req.session.userId = -1;

            res.redirect('/');
        } else {
            const foundUser = await UserModel.findOne({where: {login: userLogin}});

            if (foundUser === null)
                throw new Error('Invalid user');

            if (crypto.createHash('sha256').update(userPassword).digest('hex') !== foundUser.password) {
                throw new Error('Invalid password');
            }

            req.session.role = 'user';
            req.session.userName = foundUser.login;
            req.session.userId = foundUser.id;
            req.session.isAuthorized = true;
            req.session.isAdmin = false;

            res.redirect('/panels');
        }

    } catch (e) {
        res.render("users/authorize", {
            errors: {
                global: e.message,
                loginError: loginErrorText,
                passwordError: passwordErrorText,
            }, req: req
        });
    }
};

exports.list_get = async function (req, res) {
    if (req.session.role !== 'admin') {
        res.end('Permissions error');
        return;
    }

    let users = await UserModel.findAll();

    let copiedUsers = [];
    for (let user of users) {
        copiedUsers.push({
            id: user.dataValues.id,
            login: user.dataValues.login,
            created: user.dataValues.createdAt.toDateString()
        });
    }

    res.render('users/list', {users: copiedUsers, req: req});
}

exports.list_post = async function (req, res) {
    try {
        if (req.session.role !== 'admin') {
            res.end('Permissions error');
            return;
        }

        await UserModel.create({ login: req.body.login, password: crypto.createHash('sha256').update(req.body.password).digest('hex') });
        res.redirect('/users/list');
    } catch (e) {
        res.end(e.message);
    }
}

exports.logout = function(req, res) {
    try {
        if (!req.session.isAuthorized) {
            res.redirect('/');
            return;
        }

        req.session.destroy();
        res.redirect('/');
    } catch (e) {
        res.end(e.message);
    }
}

exports.action_delete = async function (req, res) {
    try {
        if (req.session.role !== 'admin') {
            res.end('Permissions error');
            return;
        }

        let user = await UserModel.findByPk(req.params.id);
        await user.destroy();
        res.redirect('/users/list');
    } catch (e) {
        res.end(e);
    }
}
