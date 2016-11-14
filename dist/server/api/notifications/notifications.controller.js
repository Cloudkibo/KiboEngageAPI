'use strict';

var _ = require('lodash');
var Notifications = require('./notifications.model');
var user = require('../user/user.model');
var configuration = require('../configuration/configuration.model');

// Get list of Notificationss
exports.index = function(req, res) {
  Notifications.find({companyid: req.user.uniqueid}, function (err, notifications) {
    if(err) { return handleError(res, err); }
    return res.json(200, notifications);
  });
};

// Get list of Notificationss
exports.show = function(req, res) {
  Notifications.findOne({companyid: req.user.uniqueid, _id: req.body.id}, function (err, notification) {
    if(err) { return handleError(res, err); }
    return res.json(200, notification);
  });
};

exports.showbyid = function(req, res) {
  Notifications.findOne({companyid: req.body.companyid, uniqueid: req.body.uniqueid}, function (err, notification) {
    if(err) { return handleError(res, err); }
    return res.json(200, notification);
  });
};


exports.showbydate = function(req, res) {
  Notifications.find({companyid: req.body.companyid,datetime : { $gte : new Date(req.body.datetime) }}, function (err, notification) {
    if(err) { return handleError(res, err); }
    return res.json(200, notification);
  });
};


// Creates a new Notifications in the DB.
exports.create = function(req, res) {
  Notifications.create(req.body, function(err, notification) {
    if(err) { return handleError(res, err); }
    return res.json(201, notification);
  });
};

// Updates an existing Notifications in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Notifications.findById(req.params.id, function (err, notification) {
    if (err) { return handleError(res, err); }
    if(!notification) { return res.send(404); }
    var updated = _.merge(notification, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, notification);
    });
  });
};

exports.statsbyagent = function(req, res){
  if(req.user.isOwner == 'Yes') {
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Notifications.aggregate({
          $match :
          {
            companyid : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { agent_id : "$agent_id"},
            count: { $sum: 1 }
          }
        }, function (err, gotData){
          if(err) { return handleError(res, err); }
          user.find({uniqueid : clientUser.uniqueid, isDeleted : 'No'}, function(err3, gotAgents){
            return res.json(200, {notficationsCount : gotData, agentData : gotAgents});
          })
        })
    })
  } else {
    Notifications.aggregate({
        $match :
        {
          companyid : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { agent_id : "$agent_id"},
          count: { $sum: 1 }
        }
      }, function (err, gotData){
        if(err) { return handleError(res, err); }
        user.find({uniqueid : req.user.uniqueid, isDeleted : 'No'}, function(err3, gotAgents){
          return res.json(200, {notficationsCount : gotData, agentData : gotAgents});
        })
      })
  }
};

// Deletes a Notifications from the DB.
exports.destroy = function(req, res) {
  Notifications.findById(req.params.id, function (err, notification) {
    if(err) { return handleError(res, err); }
    if(!notification) { return res.send(404); }
    notification.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
