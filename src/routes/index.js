const express = require('express');
const router = express.Router();

router.use('/', require('./fragments'));

module.exports = router;
