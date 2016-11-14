'use strict';

var _ = require('lodash');
var Shortcut = require('./shortcut.model');
var User = require('../user/user.model');
var deptagent = require('../deptagent/deptagent.model');

// Get list of Shortcuts
exports.index = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Shortcut.find({companyid : clientUser.uniqueid} , function (err, gotShortcuts){
        if(err) { return handleError(res, err); }
        return res.json(200, gotShortcuts);
      })
    })
  }
  else if(req.user.isAdmin == 'Yes' || req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){
    Shortcut.find({companyid : req.user.uniqueid}, function (err, gotShortcuts){
      if(err) { return handleError(res, err); }
      return res.json(200, gotShortcuts);
    })

  }
  /*else if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    //code comment by - zarmeen
    // below code is not needed.Since Shortcodes are throughout company.No restrictions on department level
   
    /*deptagent.find({
      companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
    }).exec(function (err, gotDeptsData){

      var departmentsIdArray = new Array();

      for(var index in gotDeptsData){

        departmentsIdArray[index] = gotDeptsData[index].deptid;

      }
        Shortcut.find({companyid : req.user.uniqueid}, function (err, gotShortcuts){
      if(err) { return handleError(res, err); }
      return res.json(200, gotShortcuts);
    })
   }  */
      

  
  
};

// Get a single Shortcut
exports.show = function(req, res) {
  Shortcut.findById(req.params.id, function (err, shortcut) {
    if(err) { return handleError(res, err); }
    if(!shortcut) { return res.send(404); }
    return res.json(shortcut);
  });
};

// Creates a new Shortcut in the DB.
exports.create = function(req, res) {
  Shortcut.create(req.body, function(err, shortcut) {
    if(err) { return handleError(res, err); }
    return res.json(201, shortcut);
  });
};

// Updates an existing Shortcut in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Shortcut.findById(req.params.id, function (err, shortcut) {
    if (err) { return handleError(res, err); }
    if(!shortcut) { return res.send(404); }
    var updated = _.merge(shortcut, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, shortcut);
    });
  });
};

// Deletes a Shortcut from the DB.
exports.destroy = function(req, res) {
  Shortcut.findById(req.params.id, function (err, shortcut) {
    if(err) { return handleError(res, err); }
    if(!shortcut) { return res.send(404); }
    shortcut.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
