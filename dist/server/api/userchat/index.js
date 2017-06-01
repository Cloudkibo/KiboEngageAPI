'use strict';

var express = require('express');
var controller = require('./userchat.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/sync', auth.isAuthenticated(), controller.sync);
router.post('/visitoremail', auth.isAuthenticated(), controller.visitoremail);
//router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthorizedWebHookTrigger(), controller.create);
router.post('/create', auth.isAuthenticated(), controller.create);
router.post('/getSpecificChat', auth.isAuthenticated(), controller.getSpecificChat);
router.post('/updateStatus', auth.isAuthenticated(), controller.updateStatus);
router.post('/partialChatSync', auth.isAuthenticated(), controller.partialChatSync);

router.post('/fetchChat', auth.isAuthenticated(), controller.fetchChat);
//router.put('/:id', auth.isAuthenticated(), controller.update);
//router.patch('/:id', auth.isAuthenticated(), controller.update);
//router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
