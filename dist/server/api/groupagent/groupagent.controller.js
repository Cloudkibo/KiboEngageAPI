'use strict';

var _ = require('lodash');
var Deptagent = require('./groupagent.model');
var User = require('../user/user.model');

// Get list of deptagents
exports.index = function(req, res) {
  Deptagent.find({companyid : req.user.uniqueid,deleteStatus : 'No'}).populate('groupid agentid').exec(function (err, deptagents) {
    if(err) { return handleError(res, err); }
    return res.json(200, deptagents);
  });
};

// Get a single deptagent
exports.show = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Deptagent.find({companyid : clientUser.uniqueid, groupid: req.params.id, deleteStatus : 'No'}).populate('groupid agentid').exec(function (err, deptagent){

        if(err) { return handleError(res, err); }
        if(!deptagent) { return res.send(404); }
        return res.json(deptagent);

      })
    })
  } else if(req.user.isAdmin == 'Yes'){

    Deptagent.find({companyid : req.user.uniqueid, groupid: req.params.id, deleteStatus : 'No'}).populate('groupid agentid').exec(function (err, deptagent){

      if(err) { return handleError(res, err); }
      if(!deptagent) { return res.send(404); }
      return res.json(deptagent);

    })
  }
  else if(req.user.isSupervisor == 'Yes' || req.user.isAgent === 'Yes'){

    Deptagent.count({deptid : req.params.id, agentid : req.user._id}, function(err, gotCount){
      if (err) return console.log(err)

      if(gotCount>0){

        Deptagent.find({companyid : req.user.uniqueid, groupid: req.params.id, deleteStatus : 'No'}).populate('groupid agentid').exec(function (err, deptagent){

          if(err) { return handleError(res, err); }
          if(!deptagent) { return res.send(404); }
          return res.json(deptagent);

        })
      }
      else {
        res.json(501, {});
      }

    })

  }
  else
    res.send({status: 501});

};

// Creates a new deptagent in the DB.
exports.create = function(req, res) {
  Deptagent.create(req.body, function(err, deptagent) {
    if(err) { return handleError(res, err); }
    return res.json(201, deptagent);
  });
};

// Updates an existing deptagent in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Deptagent.findById(req.params.id, function (err, deptagent) {
    if (err) { return handleError(res, err); }
    if(!deptagent) { return res.send(404); }
    var updated = _.merge(deptagent, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, deptagent);
    });
  });
};

// Deletes a deptagent from the DB.
exports.destroy = function(req, res) {
  Deptagent.findById(req.params.id, function (err, deptagent) {
    if(err) { return handleError(res, err); }
    if(!deptagent) { return res.send(404); }
    deptagent.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
