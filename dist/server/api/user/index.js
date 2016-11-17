'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var router = express.Router();

router.get('/', auth.hasRole('owner'), controller.index);
router.post('/changeviewas', auth.hasRole('owner'), controller.changeviewas);
router.get('/allagents', auth.isAuthenticated(), controller.allagents);
router.post('/profilesettings', auth.isAuthenticated(), controller.profilesettings);
router.post('/saveemailsforinvite', auth.isAuthenticated(), controller.saveemailsforinvite);
router.post('/saveemailsforabandoned', auth.isAuthenticated(), controller.saveemailsforabandoned);
router.post('/saveemailsforcompleted', auth.isAuthenticated(), controller.saveemailsforcompleted);
router.post('/setdefaultinviteemail1', auth.isAuthenticated(), controller.setdefaultinviteemail1);
router.post('/setdefaultinviteemail2', auth.isAuthenticated(), controller.setdefaultinviteemail2);
router.post('/setdefaultinviteemail3', auth.isAuthenticated(), controller.setdefaultinviteemail3);
router.post('/setdefaultabandonedemail1', auth.isAuthenticated(), controller.setdefaultabandonedemail1);
router.post('/setdefaultabandonedemail2', auth.isAuthenticated(), controller.setdefaultabandonedemail2);
router.post('/setdefaultabandonedemail3', auth.isAuthenticated(), controller.setdefaultabandonedemail3);
router.post('/setdefaultcompletedemail1', auth.isAuthenticated(), controller.setdefaultcompletedemail1);
router.post('/setdefaultcompletedemail2', auth.isAuthenticated(), controller.setdefaultcompletedemail2);
router.post('/setdefaultcompletedemail3', auth.isAuthenticated(), controller.setdefaultcompletedemail3);
router.post('/deleteagent/:id', auth.isAuthenticated(), controller.deleteagent);
router.post('/updaterole', auth.isAuthenticated(), controller.updaterole);
router.post('/updateprofile', auth.isAuthenticated(), controller.updateprofile);
router.post('/updateprofilepicture', auth.isAuthenticated(), controller.updateprofilepicture);
router.post('/updaterightsforsuperuser', auth.isAuthenticated(), controller.updaterightsforsuperuser);
router.post('/requestpasswordchange', controller.requestpasswordchange);
router.post('/requestpasswordchangeKiboEngage',controller.requestpasswordchangeKiboEngage);


router.post('/changepassword', controller.changepassword);
router.get('/reapplyverificationlink', auth.isAuthenticated(), controller.reapplyverificationlink);
router.post('/userimage/update', auth.isAuthenticated(), multipartyMiddleware, controller.updateimage);
router.get('/userimage/:image', controller.userimage);
router.delete('/:id', auth.hasRole('owner'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.post('/resetpassword', auth.isAuthenticated(), controller.resetpassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.post('/kiboengage',controller.createKiboEngageUser);
router.get('/reapplyverificationlink/kiboengage', auth.isAuthenticated(), controller.reapplyverificationlinkKiboEngage);
router.get('/ping', function(req, res){
  res.send('ping response sent at '+ Date.now());
})
module.exports = router;
