'use strict';

var _ = require('lodash');
var AgentAssignments = require('./agentassignment.model');
var user = require('../user/user.model');
var configuration = require('../configuration/configuration.model');

// Get list of AgentAssignmentss
exports.index = function(req, res) {
  AgentAssignments.find(function (err, agentassignments) {
    if(err) { return handleError(res, err); }
    return res.json(200, agentassignments);
  });
};

// Creates a new AgentAssignments in the DB.
exports.create = function(req, res) {
  AgentAssignments.create(req.body, function(err, agentassignment) {
    if(err) { return handleError(res, err); }
    return res.json(201, agentassignment);
  });
};

// Updates an existing AgentAssignments in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  AgentAssignments.findById(req.params.id, function (err, agentassignment) {
    if (err) { return handleError(res, err); }
    if(!agentassignment) { return res.send(404); }
    var updated = _.merge(agentassignment, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, agentassignment);
    });
  });
};

// Deletes a AgentAssignments from the DB.
exports.destroy = function(req, res) {
  AgentAssignments.findById(req.params.id, function (err, agentassignment) {
    if(err) { return handleError(res, err); }
    if(!agentassignment) { return res.send(404); }
    agentassignment.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
