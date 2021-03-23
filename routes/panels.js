const express = require('express');
const router = express.Router();

const panels_controller = require('../controllers/panelsController');

router.get('/', panels_controller.index_get);

module.exports = router;