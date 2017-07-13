'use strict';

var express = require('express');
var controller = require('./readstatus.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/getunreadsessionscount', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.create);

module.exports = router;
