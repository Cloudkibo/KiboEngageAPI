'use strict';

var _ = require('lodash');
var Ipcountry = require('./ipcountry.model');

// Get list of ipcountrys
exports.index = function(req, res) {
  Ipcountry.find(function (err, ipcountrys) {
    if(err) { return handleError(res, err); }
    return res.json(200, ipcountrys);
  });
};

// Get a single ipcountry
exports.show = function(req, res) {
  console.log('inside the get ip information route')
  console.log(req.params.id);
  Ipcountry.findOne({startipint : {$lte : req.params.id}, endipint : {$gte : req.params.id}}, function(err, ipcountry){
    if(err) { return handleError(res, err); }
    if(!ipcountry) { return res.send(404); }
    console.log(ipcountry);
    return res.json(ipcountry);
  })
};

// Creates a new ipcountry in the DB.
exports.create = function(req, res) {
  Ipcountry.create(req.body, function(err, ipcountry) {
    if(err) { return handleError(res, err); }
    return res.json(201, ipcountry);
  });
};

// Updates an existing ipcountry in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Ipcountry.findById(req.params.id, function (err, ipcountry) {
    if (err) { return handleError(res, err); }
    if(!ipcountry) { return res.send(404); }
    var updated = _.merge(ipcountry, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, ipcountry);
    });
  });
};

// Deletes a ipcountry from the DB.
exports.destroy = function(req, res) {
  Ipcountry.findById(req.params.id, function (err, ipcountry) {
    if(err) { return handleError(res, err); }
    if(!ipcountry) { return res.send(404); }
    ipcountry.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
