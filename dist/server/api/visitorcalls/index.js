'use strict';

var express = require('express');
var controller = require('./visitorcalls.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/kiboengagesessions', auth.isAuthenticated(), controller.index2);
router.get('/waitingcalls', auth.isAuthenticated(), controller.waitingcalls);
router.get('/abandonedcalls', auth.isAuthenticated(), controller.abandonedcalls);
router.get('/mypickedcalls', auth.isAuthenticated(), controller.mypickedcalls);
router.get('/progresscalls', auth.isAuthenticated(), controller.progresscalls);
router.get('/completedcalls', auth.isAuthenticated(), controller.completedcalls);
router.get('/consolidatedcalls', auth.isAuthenticated(), controller.consolidatedcalls);
router.get('/pagestats', auth.isAuthenticated(), controller.pagestats);
router.get('/reportsv2/pagestats', auth.isAuthenticated(), controller.pagestats2);
router.get('/reportsv2/statsbyplatform', auth.isAuthenticated(), controller.statsbyplatform);
router.get('/reportsv2/statsbydevice', auth.isAuthenticated(), controller.statsbydevice);
router.post('/reportsv2/statsbymessagechannel', auth.isAuthenticated(), controller.statsbymessagechannel);
router.get('/reportsv2/statsbyagents', auth.isAuthenticated(), controller.statsbyagents);
router.get('/reportsv2/topcustomers', auth.isAuthenticated(), controller.topcustomers);
router.get('/agentcallstats', auth.isAuthenticated(), controller.agentcallstats);
router.get('/deptcallstats', auth.isAuthenticated(), controller.deptcallstats);
router.get('/reportsv2/deptcallstats', auth.isAuthenticated(), controller.deptcallstats2);
router.get('/datewisecallstats', auth.isAuthenticated(), controller.datewisecallstats);
router.post('/visitorjoin', controller.visitorjoin);
router.post('/createsession', auth.isAuthenticated(), controller.createsession);
router.post('/createbulksession',auth.isAuthenticated(),controller.createbulksession);

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
router.post('/updateStatus', auth.isAuthenticated(), controller.updateStatus);
router.post('/rescheduleAbandonedSession', auth.isAuthenticated(), controller.rescheduleAbandonedSession);
router.post('/assignToAgent', auth.isAuthenticated(), controller.assignToAgent);
router.post('/assignToChannel', auth.isAuthenticated(), controller.assignToChannel);
router.post('/pickSession', auth.isAuthenticated(), controller.pickSession);
router.post('/resolveSession', auth.isAuthenticated(), controller.resolveSession);
router.post('/getcustomersessions', auth.isAuthenticated(), controller.getcustomersessions);

router.post('/getSession', auth.isAuthenticated(), controller.show);
router.post('/', auth.isAuthenticated(), controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);

module.exports = router;
