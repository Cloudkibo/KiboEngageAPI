'use strict';

var _ = require('lodash');
var FbPageteam = require('./fbpageteam.model');
var User = require('../user/user.model');

// Get list of FbPageteams
exports.index = function(req, res) {
  FbPageteam.find(function (err, fbpageteams) {
    if(err) { return handleError(res, err); }
    return res.json(200, fbpageteams);
  });
};

// Get a single fbpageteam
exports.show = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      FbPageteam.find({companyid : clientUser.uniqueid, pageid: req.params.id, deleteStatus : 'No'}).populate('pageid teamid').exec(function (err, fbpageteam){

        if(err) { return handleError(res, err); }
        if(!fbpageteam) { return res.send(404); }
        return res.json(fbpageteam);

      })
    })
  } else{ 
    FbPageteam.find({companyid : req.user.uniqueid, pageid: req.params.id, deleteStatus : 'No'}).populate('pageid teamid').exec(function (err, fbpageteam){

      if(err) { return handleError(res, err); }
      if(!fbpageteam) { return res.send(404); }
      return res.json(fbpageteam);

    })
  }


  
};

// Creates a new FbPageteam in the DB.
exports.create = function(req, res) {
  FbPageteam.create(req.body, function(err, fbpageteam) {
    if(err) { return handleError(res, err); }
    return res.json(201, fbpageteam);
  });
};

// Updates an existing fbpageteam in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  FbPageteam.findById(req.params.id, function (err, fbpageteam) {
    if (err) { return handleError(res, err); }
    if(!fbpageteam) { return res.send(404); }
    var updated = _.merge(fbpageteam, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, fbpageteam);
    });
  });
};

// Deletes a fbpageteam from the DB.
exports.destroy = function(req, res) {
  FbPageteam.findById(req.params.id, function (err, fbpageteam) {
    if(err) { return handleError(res, err); }
    if(!fbpageteam) { return res.send(404); }
    fbpageteam.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
