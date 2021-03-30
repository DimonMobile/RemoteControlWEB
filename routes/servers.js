const express = require('express');
const router = express.Router();

const servers_controller = require('../controllers/serversController');

router.get('/list', servers_controller.list_get);
router.post('/list', servers_controller.list_post);

router.get('/users/:id', servers_controller.users_get);
router.post('/users/:id', servers_controller.users_post);

router.get('/status/:id', servers_controller.status_get);

router.get('/actions/delete/:id', servers_controller.action_delete);
router.get('/actions/deleteLink/:id', servers_controller.action_deleteLink);

module.exports = router;