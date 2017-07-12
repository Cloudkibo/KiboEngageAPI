'use strict';

var _ = require('lodash');
var Deptteam = require('./deptteam.model');
var User = require('../user/user.model');
var groupagent = require('../groupagent/groupagent.model');

// Get list of deptteams
exports.index = function(req, res) {
Deptteam.find({companyid : req.user.uniqueid,deleteStatus : 'No'}).populate('deptid teamid').exec(function (err, deptteams) {
    if(err) { return handleError(res, err); }
    return res.json(200, deptteams);
  });
};


exports.showTeamandAgents = function(req, res) {
Deptteam.find({companyid : req.user.uniqueid,deleteStatus : 'No'}).populate('deptid teamid').exec(function (err, deptteams) {
    if(err) { return handleError(res, err); }
     //get team agents
     groupagent.find({companyid : req.user.uniqueid,deleteStatus : 'No'}).populate('groupid agentid').exec(function (err, teamagents) {
          if(err) { return handleError(res, err); }
          return res.json(200, {teamagents:teamagents,deptteams:deptteams});
           });
   // return res.json(200, deptteams);
  });
};

exports.getallAgents = function(req, res) {
  Deptteam.find({companyid : req.user.uniqueid, deptid: req.params.id, deleteStatus : 'No'}, function (err, deptteams) {
      if(err) { return handleError(res, err); }
      var teams = [];

      for(var i in deptteams) {
        teams.push(deptteams[i].teamid);
      }

      groupagent.find({groupid : {$in : teams}}).populate('agentid').exec(function(err3, agentsgroup){
        if(err3) { return handleError(res, err3); }
        var agents = [];

        for(var i in agentsgroup){
          agents.push(agentsgroup[i].agentid);
        }
        return res.json(200, agents);
      })

    });
};

// Get a single deptteam
exports.show = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Deptteam.find({companyid : clientUser.uniqueid, deptid: req.params.id, deleteStatus : 'No'}).populate('deptid teamid').exec(function (err, deptteam){

        if(err) { return handleError(res, err); }
        if(!deptteam) { return res.send(404); }
        return res.json(deptteam);

      })
    })
  } else{
    Deptteam.find({companyid : req.user.uniqueid, deptid: req.params.id, deleteStatus : 'No'}).populate('deptid teamid').exec(function (err, deptteam){

      if(err) { return handleError(res, err); }
      if(!deptteam) { return res.send(404); }
      return res.json(deptteam);

    })
  }



};

// Creates a new deptteam in the DB.
exports.create = function(req, res) {
  Deptteam.create(req.body, function(err, deptteam) {
    if(err) { return handleError(res, err); }
    return res.json(201, deptteam);
  });
};

// Updates an existing deptteam in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Deptteam.findById(req.params.id, function (err, deptteam) {
    if (err) { return handleError(res, err); }
    if(!deptteam) { return res.send(404); }
    var updated = _.merge(deptteam, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, deptteam);
    });
  });
};

// Deletes a deptteam from the DB.
exports.destroy = function(req, res) {
  Deptteam.findById(req.params.id, function (err, deptteam) {
    if(err) { return handleError(res, err); }
    if(!deptteam) { return res.send(404); }
    deptteam.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
