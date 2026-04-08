const express = require('express');
const router = express.Router();
const { createVisitor } = require('../controllers/visitorController');

router.post('/', createVisitor);

module.exports = router;