'use strict';

var _ = require('lodash');
var readstatus = require('./readstatus.model');
var Deptteam = require('../deptteam/deptteam.model');
var User = require('../user/user.model');
var groupagent = require('../groupagent/groupagent.model');
var logger = require('../../components/logger/logger');
var fbpageteam = require('../fbpageTeam/fbpageteam.model');

exports.index = function(req, res) {
  readstatus.find({agent_id: req.body.agent_id})
  readstatus.aggregate(
    {
      $match :
      {
        agent_id: req.body.agent_id
      }
    },
    {
      $group : {
        _id : { request_id : "$request_id" },
        count: { $sum: 1 }
      }
    }, function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })
}

exports.create = function(req, res) {
  if(req.body.requst_id.indexOf('$') > -1){
    fbpageteam.find({companyid : req.body.company_id, pageid: req.body.group_id, deleteStatus : 'No'}, function (err, deptteams) {
        if(err) { return handleError(res, err); }

        logger.serverLog('info', 'going to get all the teams route for a department');
        console.log('going to get all the teams route for a department');

        logger.serverLog('info', deptteams);
        console.log(deptteams);

        var teams = [];

        for(var i in deptteams) {
          teams.push(deptteams[i].teamid);
        }

        logger.serverLog('info', 'these teams are in this deparment');
        console.log('these teams are in this department');

        logger.serverLog('info', teams);
        console.log(teams);

        groupagent.find({groupid : {$in : teams}}).populate('agentid').exec(function(err3, agentsgroup){
          if(err3) { return handleError(res, err3); }

          logger.serverLog('info', 'these are agents in the teams');
          console.log('these are agents in the teams');

          logger.serverLog('info', agentsgroup);
          console.log(agentsgroup);

          for(var i in agentsgroup){
            if(agentsgroup[i].agentid.isDeleted === 'No'){
              var selectedAgent = agentsgroup[i].agentid;
              var readstatusPayload = {
                company_id : req.body.company_id,
                request_id : req.body.request_id,
                message_id : req.body.message_id,
                agent_id : selectedAgent._id
              };
              readstatus.create(readstatusPayload, function(err, record){
              });
            }
          }
          return res.json(200, {status: 'success'});
        })
      });
  } else {
    Deptteam.find({companyid : req.body.company_id, deptid: req.body.group_id, deleteStatus : 'No'}, function (err, deptteams) {
        if(err) { return handleError(res, err); }

        logger.serverLog('info', 'going to get all the teams route for a department');
        console.log('going to get all the teams route for a department');

        logger.serverLog('info', deptteams);
        console.log(deptteams);

        var teams = [];

        for(var i in deptteams) {
          teams.push(deptteams[i].teamid);
        }

        logger.serverLog('info', 'these teams are in this deparment');
        console.log('these teams are in this department');

        logger.serverLog('info', teams);
        console.log(teams);

        groupagent.find({groupid : {$in : teams}}).populate('agentid').exec(function(err3, agentsgroup){
          if(err3) { return handleError(res, err3); }

          logger.serverLog('info', 'these are agents in the teams');
          console.log('these are agents in the teams');

          logger.serverLog('info', agentsgroup);
          console.log(agentsgroup);

          for(var i in agentsgroup){
            if(agentsgroup[i].agentid.isDeleted === 'No'){
              var selectedAgent = agentsgroup[i].agentid;
              var readstatusPayload = {
                company_id : req.body.company_id,
                request_id : req.body.request_id,
                message_id : req.body.message_id,
                agent_id : selectedAgent._id
              };
              readstatus.create(readstatusPayload, function(err, record){
              });
            }
          }
          return res.json(200, {status: 'success'});
        })
      });
  }

};
