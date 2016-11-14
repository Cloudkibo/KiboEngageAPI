'use strict';

var express = require('express');
var controller = require('./agentinitiatedcalls.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/myscheduledcalls', auth.isAuthenticated(), controller.myscheduledcalls);
router.post('/invitetocall', auth.isAuthenticated(), controller.invitetocall);
router.post('/reschedulecall', auth.isAuthenticated(), controller.reschedulecall);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
