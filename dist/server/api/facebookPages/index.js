'use strict';

var express = require('express');
var controller = require('./fbpages.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/getpage', auth.isAuthenticated(), controller.show);
router.post('/getpagewithTeams', auth.isAuthenticated(), controller.showfbpage);

router.get('/', auth.isAuthenticated(), controller.index);
router.post('/', auth.isAuthenticated(), controller.create);


router.put('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.post('/deletefbpages', auth.isAuthenticated(), controller.deletefbpages);
/*router.patch('/:id', auth.isAuthenticated(), controller.update);

*/
module.exports = router;
