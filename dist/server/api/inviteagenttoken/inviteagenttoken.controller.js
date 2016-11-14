'use strict';

var _ = require('lodash');
var Inviteagenttoken = require('./inviteagenttoken.model');

// Get list of inviteagenttokens
exports.index = function(req, res) {
  Inviteagenttoken.find(function (err, inviteagenttokens) {
    if(err) { return handleError(res, err); }
    return res.json(200, inviteagenttokens);
  });
};

// Get a single inviteagenttoken
exports.show = function(req, res) {
  Inviteagenttoken.findOne({token: req.params.id}, function (err, inviteagenttoken) {
    if(err) { return handleError(res, err); }
    if(!inviteagenttoken) { return res.send(404); }
    return res.json(inviteagenttoken);
  });
};

// Creates a new inviteagenttoken in the DB.
exports.create = function(req, res) {
  Inviteagenttoken.create(req.body, function(err, inviteagenttoken) {
    if(err) { return handleError(res, err); }
    return res.json(201, inviteagenttoken);
  });
};

// Updates an existing inviteagenttoken in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Inviteagenttoken.findById(req.params.id, function (err, inviteagenttoken) {
    if (err) { return handleError(res, err); }
    if(!inviteagenttoken) { return res.send(404); }
    var updated = _.merge(inviteagenttoken, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, inviteagenttoken);
    });
  });
};

// Deletes a inviteagenttoken from the DB.
exports.destroy = function(req, res) {
  Inviteagenttoken.findById(req.params.id, function (err, inviteagenttoken) {
    if(err) { return handleError(res, err); }
    if(!inviteagenttoken) { return res.send(404); }
    inviteagenttoken.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
