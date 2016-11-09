'use strict';

var express = require('express');
var controller = require('./businesshours.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/waitingcalls', auth.isAuthenticated(), controller.waitingcalls);
router.get('/abandonedcalls', auth.isAuthenticated(), controller.abandonedcalls);
router.get('/mypickedcalls', auth.isAuthenticated(), controller.mypickedcalls);
router.get('/progresscalls', auth.isAuthenticated(), controller.progresscalls);
router.get('/completedcalls', auth.isAuthenticated(), controller.completedcalls);
router.get('/consolidatedcalls', auth.isAuthenticated(), controller.consolidatedcalls);
router.get('/pagestats', auth.isAuthenticated(), controller.pagestats);
router.get('/agentcallstats', auth.isAuthenticated(), controller.agentcallstats);
router.get('/deptcallstats', auth.isAuthenticated(), controller.deptcallstats);
router.get('/datewisecallstats', auth.isAuthenticated(), controller.datewisecallstats);
router.post('/visitorjoin', controller.visitorjoin);
router.post('/scheduledvisitorjoin', controller.scheduledvisitorjoin);
router.post('/callsummary', controller.callsummary);
router.post('/visitorcallsummary', auth.isAuthenticated(), controller.visitorcallsummary);
router.post('/updatecallsummary', controller.updatecallsummary);
router.post('/visitorleft', controller.visitorleft);
router.post('/visitorcallpicked', auth.isAuthenticated(), controller.visitorcallpicked);
router.post('/visitorcallcompleted', auth.isAuthenticated(), controller.visitorcallcompleted);
router.post('/schedulemakeupcall', auth.isAuthenticated(), controller.schedulemakeupcall);
router.post('/setsocketid', controller.setsocketid);
router.post('/getcallsinrange', auth.isAuthenticated(), controller.getcallsinrange);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;

