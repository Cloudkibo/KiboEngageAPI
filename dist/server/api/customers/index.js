'use strict';

var express = require('express');
var controller = require('./customers.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/reportsv2/statsbycountry', auth.isAuthenticated(), controller.statsbycountry);
router.get('/reportsv2/statsbymobile', auth.isAuthenticated(), controller.statsbymobile);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/getcustomer', auth.isAuthenticated(), controller.show);

router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
