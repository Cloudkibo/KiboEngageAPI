'use strict';

var _ = require('lodash');
var Passwordresettoken = require('./passwordresettoken.model');

// Get list of passwordresettokens
exports.index = function(req, res) {
  Passwordresettoken.find(function (err, passwordresettokens) {
    if(err) { return handleError(res, err); }
    return res.json(200, passwordresettokens);
  });
};

// Get a single passwordresettoken
exports.show = function(req, res) {
  Passwordresettoken.findOne({token: req.params.id}, function (err, passwordresettoken) {
    if(err) { console.log(err); return handleError(res, err); }
    if(!passwordresettoken) { return res.send(404); }
    return res.json(passwordresettoken);
  });
};

// Creates a new passwordresettoken in the DB.
exports.create = function(req, res) {
  Passwordresettoken.create(req.body, function(err, passwordresettoken) {
    if(err) { return handleError(res, err); }
    return res.json(201, passwordresettoken);
  });
};

// Updates an existing passwordresettoken in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Passwordresettoken.findById(req.params.id, function (err, passwordresettoken) {
    if (err) { return handleError(res, err); }
    if(!passwordresettoken) { return res.send(404); }
    var updated = _.merge(passwordresettoken, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, passwordresettoken);
    });
  });
};

// Deletes a passwordresettoken from the DB.
exports.destroy = function(req, res) {
  Passwordresettoken.findById(req.params.id, function (err, passwordresettoken) {
    if(err) { return handleError(res, err); }
    if(!passwordresettoken) { return res.send(404); }
    passwordresettoken.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
