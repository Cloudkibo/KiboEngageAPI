'use strict';

var _ = require('lodash');
var Companyprofile = require('./companyprofile.model');
var department = require('../department/department.model');
var configuration = require('../configuration/configuration.model');
var User = require('../user/user.model');

// Get list of companyprofiles
exports.index = function(req, res) {
  Companyprofile.find(function (err, companyprofiles) {
    if(err) { return handleError(res, err); }
    return res.json(200, companyprofiles);
  });
};

// Get specific company's profile
exports.fetch = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, {});
      Companyprofile.findOne({companyid : clientUser.uniqueid}, function (err, companyprofile){
        if(err) { return handleError(res, err); }
        return res.json(200, companyprofile);
      })
    })
  } else {
    Companyprofile.findOne({companyid : req.user.uniqueid}, function (err, companyprofile){
      if(err) { return handleError(res, err); }
      return res.json(200, companyprofile);
    })
  }


};

// Update the company profile and settings
exports.updatecompanyprofile = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      Companyprofile.findOne({companyid: clientUser.uniqueid}, function(err, gotSaveChangedCompanySettingsData){

        configuration.findOne({}, function (err, gotConfig) {
          if (err) return console.log(err);

          if(req.body.maxnumberofdepartment > gotConfig.maxnumberofdepartment){
            res.send({status: 'danger', msg: 'Max number of Groups cannot exceed '+ gotConfig.maxnumberofdepartment});
          }
          else if(req.body.allowChat === 'Yes' && gotConfig.allowChat === 'No'){
            res.send({status: 'danger', msg: 'Cannot allow Chat. Please contact Kibosupport owner to enable the feature'});
          }
          else if(req.body.showsummary === 'Yes' && gotConfig.showsummary === 'No'){
            res.send({status: 'danger', msg: 'Cannot allow Summary. Please contact Kibosupport owner to enable the feature'});
          }
          else if(req.body.allowCompletingOfCalls === 'Yes' && gotConfig.allowCompletingOfCalls === 'No'){
            res.send({status: 'danger', msg: 'Completing of calls by system is disabled. Please contact Kibosupport owner to enable the feature'});
          }
          else if(req.body.isdomainemail === 'Yes' && gotConfig.isdomainemail === 'No'){
            res.send({status: 'danger', msg: 'Domain emails cannot be changed. Please contact Kibosupport owner to enable the feature'});
          }
          else if(req.body.allowemailnotification === 'Yes' && gotConfig.allowemailnotification === 'No'){
            res.send({status: 'danger', msg: 'Email notification cannot be allowed. Please contact Kibosupport owner to enable the feature'});
          }
          //else if(req.body.notificationemailaddress === 'Yes' && gotConfig.notificationemailaddress === 'No'){
          //  res.send({status: 'danger', msg: 'Domain emails cannot be changed. Please contact Kibosupport owner to enable the feature'});
          //}
          //else if(req.body.smsphonenumber === 'Yes' && gotConfig.smsphonenumber === 'No'){
          //  res.send({status: 'danger', msg: 'Domain emails cannot be changed. Please contact Kibosupport owner to enable the feature'});
          //}
          else if(req.body.allowsmsnotification === 'Yes' && gotConfig.allowsmsnotification === 'No'){
            res.send({status: 'danger', msg: 'SMS notification cannot be allowed. Please contact Kibosupport owner to enable the feature'});
          }
          else {
            department.count({companyid: clientUser.uniqueid, deleteStatus: "No"}, function (err, gotCount) {

              if (gotCount > req.body.maxnumberofdepartment) {
                res.send({status: 'danger',	msg: 'You already have ' + gotCount + ' Groups. Cannot decrease number of groups'});
              }
              else {

                gotSaveChangedCompanySettingsData.showsummary = req.body.showsummary;
                gotSaveChangedCompanySettingsData.allowChat = req.body.allowChat;
                gotSaveChangedCompanySettingsData.isdomainemail = req.body.isdomainemail;
                gotSaveChangedCompanySettingsData.notificationemailaddress = req.body.notificationemailaddress;
                gotSaveChangedCompanySettingsData.allowemailnotification = req.body.allowemailnotification;
                gotSaveChangedCompanySettingsData.smsphonenumber = req.body.smsphonenumber;
                gotSaveChangedCompanySettingsData.allowsmsnotification = req.body.allowsmsnotification;
                gotSaveChangedCompanySettingsData.abandonedscheduleemail1 = req.body.abandonedscheduleemail1;
                gotSaveChangedCompanySettingsData.abandonedscheduleemail2 = req.body.abandonedscheduleemail2;
                gotSaveChangedCompanySettingsData.abandonedscheduleemail3 = req.body.abandonedscheduleemail3;
                gotSaveChangedCompanySettingsData.completedscheduleemail1 = req.body.completedscheduleemail1;
                gotSaveChangedCompanySettingsData.completedscheduleemail2 = req.body.completedscheduleemail2;
                gotSaveChangedCompanySettingsData.completedscheduleemail3 = req.body.completedscheduleemail3;
                gotSaveChangedCompanySettingsData.invitedscheduleemail1 = req.body.invitedscheduleemail1;
                gotSaveChangedCompanySettingsData.invitedscheduleemail2 = req.body.invitedscheduleemail2;
                gotSaveChangedCompanySettingsData.invitedscheduleemail3 = req.body.invitedscheduleemail3;
                gotSaveChangedCompanySettingsData.maxnumberofdepartment = req.body.maxnumberofdepartment;
                gotSaveChangedCompanySettingsData.maxnumberofchannels = req.body.maxnumberofchannels;
                gotSaveChangedCompanySettingsData.allowCompletingOfCalls = req.body.allowCompletingOfCalls;
                gotSaveChangedCompanySettingsData.completeCallTime = req.body.completeCallTime;
                gotSaveChangedCompanySettingsData.widgetwindowtab = req.body.widgetwindowtab;
                gotSaveChangedCompanySettingsData.enableFacebook = req.body.enableFacebook;

                gotSaveChangedCompanySettingsData.save(function (err) {
                  if (err) console.log(err);

                  Companyprofile.findOne({companyid: clientUser.uniqueid}, function (err, gotCompanyData) {
                    res.send({status: 'success', msg: gotCompanyData});
                  })

                });
              }
            })
          }

        })

      })
    })
  }
  else if(req.user.isAdmin == 'Yes'){
    Companyprofile.findOne({companyid: req.user.uniqueid}, function(err, gotSaveChangedCompanySettingsData){

      configuration.findOne({}, function (err, gotConfig) {
        if (err) return console.log(err);

        if(req.body.maxnumberofdepartment > gotConfig.maxnumberofdepartment){
          res.send({status: 'danger', msg: 'Max number of Groups cannot exceed '+ gotConfig.maxnumberofdepartment});
        }
        else if(req.body.allowChat === 'Yes' && gotConfig.allowChat === 'No'){
          res.send({status: 'danger', msg: 'Cannot allow Chat. Please contact Kibosupport owner to enable the feature'});
        }
        else if(req.body.showsummary === 'Yes' && gotConfig.showsummary === 'No'){
          res.send({status: 'danger', msg: 'Cannot allow Summary. Please contact Kibosupport owner to enable the feature'});
        }
        else if(req.body.allowCompletingOfCalls === 'Yes' && gotConfig.allowCompletingOfCalls === 'No'){
          res.send({status: 'danger', msg: 'Completing of calls by system is disabled. Please contact Kibosupport owner to enable the feature'});
        }
        else if(req.body.isdomainemail === 'Yes' && gotConfig.isdomainemail === 'No'){
          res.send({status: 'danger', msg: 'Domain emails cannot be changed. Please contact Kibosupport owner to enable the feature'});
        }
        else if(req.body.allowemailnotification === 'Yes' && gotConfig.allowemailnotification === 'No'){
          res.send({status: 'danger', msg: 'Email notification cannot be allowed. Please contact Kibosupport owner to enable the feature'});
        }
        //else if(req.body.notificationemailaddress === 'Yes' && gotConfig.notificationemailaddress === 'No'){
        //  res.send({status: 'danger', msg: 'Domain emails cannot be changed. Please contact Kibosupport owner to enable the feature'});
        //}
        //else if(req.body.smsphonenumber === 'Yes' && gotConfig.smsphonenumber === 'No'){
        //  res.send({status: 'danger', msg: 'Domain emails cannot be changed. Please contact Kibosupport owner to enable the feature'});
        //}
        else if(req.body.allowsmsnotification === 'Yes' && gotConfig.allowsmsnotification === 'No'){
          res.send({status: 'danger', msg: 'SMS notification cannot be allowed. Please contact Kibosupport owner to enable the feature'});
        }
        else {
          department.count({companyid: req.user.uniqueid, deleteStatus: "No"}, function (err, gotCount) {

            if (gotCount > req.body.maxnumberofdepartment) {
              res.send({status: 'danger',	msg: 'You already have ' + gotCount + ' Groups. Cannot decrease number of groups'});
            }
            else {

              gotSaveChangedCompanySettingsData.showsummary = req.body.showsummary;
              gotSaveChangedCompanySettingsData.allowChat = req.body.allowChat;
              gotSaveChangedCompanySettingsData.isdomainemail = req.body.isdomainemail;
              gotSaveChangedCompanySettingsData.notificationemailaddress = req.body.notificationemailaddress;
              gotSaveChangedCompanySettingsData.allowemailnotification = req.body.allowemailnotification;
              gotSaveChangedCompanySettingsData.smsphonenumber = req.body.smsphonenumber;
              gotSaveChangedCompanySettingsData.allowsmsnotification = req.body.allowsmsnotification;
              gotSaveChangedCompanySettingsData.abandonedscheduleemail1 = req.body.abandonedscheduleemail1;
              gotSaveChangedCompanySettingsData.abandonedscheduleemail2 = req.body.abandonedscheduleemail2;
              gotSaveChangedCompanySettingsData.abandonedscheduleemail3 = req.body.abandonedscheduleemail3;
              gotSaveChangedCompanySettingsData.completedscheduleemail1 = req.body.completedscheduleemail1;
              gotSaveChangedCompanySettingsData.completedscheduleemail2 = req.body.completedscheduleemail2;
              gotSaveChangedCompanySettingsData.completedscheduleemail3 = req.body.completedscheduleemail3;
              gotSaveChangedCompanySettingsData.invitedscheduleemail1 = req.body.invitedscheduleemail1;
              gotSaveChangedCompanySettingsData.invitedscheduleemail2 = req.body.invitedscheduleemail2;
              gotSaveChangedCompanySettingsData.invitedscheduleemail3 = req.body.invitedscheduleemail3;
              gotSaveChangedCompanySettingsData.maxnumberofdepartment = req.body.maxnumberofdepartment;
              gotSaveChangedCompanySettingsData.maxnumberofchannels = req.body.maxnumberofchannels;
              gotSaveChangedCompanySettingsData.allowCompletingOfCalls = req.body.allowCompletingOfCalls;
              gotSaveChangedCompanySettingsData.completeCallTime = req.body.completeCallTime;
              gotSaveChangedCompanySettingsData.widgetwindowtab = req.body.widgetwindowtab;
               gotSaveChangedCompanySettingsData.enableFacebook = req.body.enableFacebook;

              gotSaveChangedCompanySettingsData.save(function (err) {
                if (err) console.log(err);

                Companyprofile.findOne({companyid: req.user.uniqueid}, function (err, gotCompanyData) {
                  res.send({status: 'success', msg: gotCompanyData});
                })

              });
            }
          })
        }

      })

    })
  }

};

// Get a single companyprofile
exports.show = function(req, res) {
  Companyprofile.findById(req.params.id, function (err, companyprofile) {
    if(err) { return handleError(res, err); }
    if(!companyprofile) { return res.send(404); }
    return res.json(companyprofile);
  });
};

// Creates a new companyprofile in the DB.
exports.create = function(req, res) {
  Companyprofile.create(req.body, function(err, companyprofile) {
    if(err) { return handleError(res, err); }
    return res.json(201, companyprofile);
  });
};

// Updates an existing companyprofile in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Companyprofile.findById(req.params.id, function (err, companyprofile) {
    if (err) { return handleError(res, err); }
    if(!companyprofile) { return res.send(404); }
    var updated = _.merge(companyprofile, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, companyprofile);
    });
  });
};

// Deletes a companyprofile from the DB.
exports.destroy = function(req, res) {
  Companyprofile.findById(req.params.id, function (err, companyprofile) {
    if(err) { return handleError(res, err); }
    if(!companyprofile) { return res.send(404); }
    companyprofile.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
