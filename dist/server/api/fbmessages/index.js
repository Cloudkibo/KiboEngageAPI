'use strict';

var express = require('express');
var controller = require('./fbmessages.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.create);
/*
router.post('/getfbcustomer', auth.isAuthenticated(), controller.show);

router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
*/
module.exports = router;
