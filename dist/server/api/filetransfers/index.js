'use strict';

var express = require('express');
var controller = require('./filetransfers.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var router = express.Router();

router.post('/download', auth.isAuthenticated(), controller.download);
router.post('/upload', auth.isAuthenticated(),controller.upload);
router.post('/partialFileSync', auth.isAuthenticated(), controller.partialFileSync);
router.post('/updateFileStatus', auth.isAuthenticated(), controller.updateStatus);


module.exports = router;
