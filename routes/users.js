const express = require('express');
const router = express.Router();

const users_controller = require('../controllers/usersController');

router.get('/authorize', users_controller.authorize_get);
router.post('/authorize', users_controller.authorize_post);
router.get('/list', users_controller.list_get);
router.post('/list', users_controller.list_post);
router.get('/logout', users_controller.logout);

router.get('/actions/delete/:id', users_controller.action_delete);

module.exports = router;