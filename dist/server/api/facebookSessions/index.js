'use strict';

var express = require('express');
var controller = require('./fbsessions.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.createsession);

router.post('/fbassignToAgent', auth.isAuthenticated(), controller.assignToAgent);
router.post('/fbresolveSession', auth.isAuthenticated(), controller.resolveSession);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
/*router.patch('/:id', auth.isAuthenticated(), controller.update);

*/
module.exports = router;
