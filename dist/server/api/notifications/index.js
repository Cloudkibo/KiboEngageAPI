'use strict';

var express = require('express');
var controller = require('./notifications.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/fetchbulksms', auth.isAuthenticated(), controller.show);
router.post('/getbulksms', auth.isAuthenticated(), controller.showbyid); //for mobile clients
router.post('/getbulksmsByDate', auth.isAuthenticated(), controller.showbydate); //for mobile clients

router.get('/statsbyagent', auth.isAuthenticated(), controller.statsbyagent);


module.exports = router;
