const express = require('express');
const router = express.Router();

const panels_controller = require('../controllers/panelsController');

router.get('/', panels_controller.index_get);
router.get('/:id', panels_controller.panels_get);

router.get('/api/state/:id', panels_controller.api_state_get);
router.post('/api/state/:id/:slaveId/:state', panels_controller.api_state_post);

module.exports = router;