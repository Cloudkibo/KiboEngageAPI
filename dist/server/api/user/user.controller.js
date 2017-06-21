'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var crypto = require("crypto");
var department = require('../department/department.model');
var deptagent = require('../deptagent/deptagent.model');
var companyprofile = require('../companyprofile/companyprofile.model');
var passwordresettoken = require('../passwordresettoken/passwordresettoken.model');
var configuration = require('../configuration/configuration.model');
var verificationtoken = require('../verificationtoken/verificationtoken.model');
var visitorcalls = require('../visitorcalls/visitorcalls.model');
var inviteagenttoken = require('../inviteagenttoken/inviteagenttoken.model');
var tempaccount = require('../tempaccount/tempaccount.model');
var group = require('../group/group.model'); //This is Team as per our new terminology - 20th Jun
var groupagent = require('../groupagent/groupagent.model'); //This is Team as per our new terminology - 20th Jun

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Save the profile settings i.e. chime and desktop notification
 */
exports.changeviewas = function(req, res) {
  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

      gotUser.ownerAs = req.body.ownerAs,

      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })

  })
};

/**
 * Get list of all agents
 */
exports.allagents = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, {});
      User.find({uniqueid : clientUser.uniqueid, isDeleted : 'No'}, function(err3, gotAgents){

        var result = {};

        result.agents = gotAgents;
        result.departments = [];

        var agentsIdArray = new Array();

        for(var index in result.agents){
          agentsIdArray[index] = result.agents[index]._id;
          result.agents[index].departments = [];
        }

        deptagent.find({agentid : {$in : agentsIdArray}, deleteStatus:'No'}).populate('deptid').exec(function(err, gotDepts){
          if(err) return res.send(500, err);

          for(index in result.agents){
            var index3 = 0;
            var departments = [];
            for(var index2 in gotDepts){
              if(gotDepts[index2].agentid.toString() == result.agents[index]._id.toString()){
                departments[index3] = gotDepts[index2].deptid.deptname;
                index3 ++;
              }
            }
            result.departments[index] = departments;
            //result.agents[index].departments = departments;
          }

          res.json(200, result);

        })

      })
    })
  } else if(req.user.isAdmin == 'Yes' || req.user.isSupervisor == 'Yes' || req.user.isAgent === 'Yes'){

    User.find({uniqueid : req.user.uniqueid, isDeleted : 'No'}, function(err3, gotAgents){

      var result = {};

      result.agents = gotAgents;
      result.departments = [];

      var agentsIdArray = new Array();

      for(var index in result.agents){
        agentsIdArray[index] = result.agents[index]._id;
        result.agents[index].departments = [];
      }

      deptagent.find({agentid : {$in : agentsIdArray}, deleteStatus:'No'}).populate('deptid').exec(function(err, gotDepts){
        if(err) return res.send(500, err);

        for(index in result.agents){
          var index3 = 0;
          var departments = [];
          for(var index2 in gotDepts){
            if(gotDepts[index2].agentid.toString() == result.agents[index]._id.toString()){
              departments[index3] = gotDepts[index2].deptid.deptname;
              index3 ++;
            }
          }
          result.departments[index] = departments;
          //result.agents[index].departments = departments;
        }

        res.json(200, result);

      })

    })
  }
  else
    res.json(501, {});

};

/**
 * Save the profile settings i.e. chime and desktop notification
 */
exports.profilesettings = function(req, res) {
  User.findById(req.user._id, function (err, gotUser) {
      if (err) return console.log(err);
      gotUser.allowchime = req.body.allowchime,
      gotUser.allownotification = req.body.allownotification,
      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })
  })
};

/**
 * Save the sample emails modified by agent to invite the person to call
 */
exports.saveemailsforinvite = function(req, res){

  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    gotUser.invitedemail1 = req.body.invitedemail1;
    gotUser.invitedemail2 = req.body.invitedemail2;
    gotUser.invitedemail3 = req.body.invitedemail3;

    gotUser.save(function(err2){
      if(err2) return console.log(err2)
      res.send({status:'success', msg:gotUser})
    })

  })

};

/**
 * Save the sample emails modified by agent to reschedule call for abandoned call
 */
exports.saveemailsforabandoned = function(req, res){

  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    gotUser.abandonedemail1 = req.body.abandonedemail1;
    gotUser.abandonedemail2 = req.body.abandonedemail2;
    gotUser.abandonedemail3 = req.body.abandonedemail3;

    gotUser.save(function(err2){
      if(err2) return console.log(err2)
      res.send({status:'success', msg:gotUser})
    })

  })

};

/**
 * Save the sample emails modified by agent to reschedule call for completed call
 */
exports.saveemailsforcompleted = function(req, res){

  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    gotUser.completedemail1 = req.body.completedemail1;
    gotUser.completedemail2 = req.body.completedemail2;
    gotUser.completedemail3 = req.body.completedemail3;

    gotUser.save(function(err2){
      if(err2) return console.log(err2)
      res.send({status:'success', msg:gotUser})
    })

  })

};

/**
 * Set the sample emails for invite email 1 to default
 */
exports.setdefaultinviteemail1 = function(req, res){

  companyprofile.findOne({companyid: req.user.uniqueid}, function(err, gotCompany){
    if (err) return console.log(err);

    User.findById(req.user._id, function (err, gotUser) {
      if (err) return console.log(err);

      gotUser.invitedemail1 = gotCompany.invitedscheduleemail1;

      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })

    })

  })

};

/**
 * Set the sample emails for invite email 2 to default
 */
exports.setdefaultinviteemail2 = function(req, res){

  companyprofile.findOne({companyid: req.user.uniqueid}, function(err, gotCompany){
    if (err) return console.log(err);

    User.findById(req.user._id, function (err, gotUser) {
      if (err) return console.log(err);

      gotUser.invitedemail2 = gotCompany.invitedscheduleemail2;

      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })

    })

  })

};

/**
 * Set the sample emails for invite email 3 to default
 */
exports.setdefaultinviteemail3 = function(req, res){

  companyprofile.findOne({companyid: req.user.uniqueid}, function(err, gotCompany){
    if (err) return console.log(err);

    User.findById(req.user._id, function (err, gotUser) {
      if (err) return console.log(err);

      gotUser.invitedemail3 = gotCompany.invitedscheduleemail3;

      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })

    })

  })

};

/**
 * Set the sample emails for abandoned email 1 to default
 */
exports.setdefaultabandonedemail1 = function(req, res){

  companyprofile.findOne({companyid: req.user.uniqueid}, function(err, gotCompany){
    if (err) return console.log(err);

    User.findById(req.user._id, function (err, gotUser) {
      if (err) return console.log(err);

      gotUser.abandonedemail1 = gotCompany.abandonedscheduleemail1;

      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })

    })

  })

};

/**
 * Set the sample emails for abandoned email 2 to default
 */
exports.setdefaultabandonedemail2 = function(req, res){

  companyprofile.findOne({companyid: req.user.uniqueid}, function(err, gotCompany){
    if (err) return console.log(err);

    User.findById(req.user._id, function (err, gotUser) {
      if (err) return console.log(err);

      gotUser.abandonedemail2 = gotCompany.abandonedscheduleemail2;

      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })

    })

  })

};

/**
 * Set the sample emails for abandoned email 3 to default
 */
exports.setdefaultabandonedemail3 = function(req, res){

  companyprofile.findOne({companyid: req.user.uniqueid}, function(err, gotCompany){
    if (err) return console.log(err);

    User.findById(req.user._id, function (err, gotUser) {
      if (err) return console.log(err);

      gotUser.abandonedemail3 = gotCompany.abandonedscheduleemail3;

      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })

    })

  })

};

/**
 * Set the sample emails for completed email 1 to default
 */
exports.setdefaultcompletedemail1 = function(req, res){

  companyprofile.findOne({companyid: req.user.uniqueid}, function(err, gotCompany){
    if (err) return console.log(err);

    User.findById(req.user._id, function (err, gotUser) {
      if (err) return console.log(err);

      gotUser.completedemail1 = gotCompany.completedscheduleemail1;

      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })

    })

  })

};

/**
 * Set the sample emails for completed email 2 to default
 */
exports.setdefaultcompletedemail2 = function(req, res){

  companyprofile.findOne({companyid: req.user.uniqueid}, function(err, gotCompany){
    if (err) return console.log(err);

    User.findById(req.user._id, function (err, gotUser) {
      if (err) return console.log(err);

      gotUser.completedemail2 = gotCompany.completedscheduleemail2;

      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })

    })

  })

};

/**
 * Set the sample emails for completed email 3 to default
 */
exports.setdefaultcompletedemail3 = function(req, res){

  companyprofile.findOne({companyid: req.user.uniqueid}, function(err, gotCompany){
    if (err) return console.log(err);

    User.findById(req.user._id, function (err, gotUser) {
      if (err) return console.log(err);

      gotUser.completedemail3 = gotCompany.completedscheduleemail3;

      gotUser.save(function(err2){
        if(err2) return console.log(err2);
        res.send({status:'success', msg:gotUser})
      })

    })

  })

};

/**
 * Delete the agent from a company. This requires admin account. Soft deletes the agent
 */
exports.deleteagent = function(req, res) {
  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      User.findOne({email : req.user.ownerAs}, function(err, clientUser){
        User.findById(req.params.id, function(err, gotAgent){
          if(err) return console.log(err);

          var today = new Date();
          var agentDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

          gotAgent.isDeleted = 'Yes';
          gotAgent.email = 'deleted '+ agentDeleteDate+ ' '+ gotAgent.email;

          gotAgent.save(function(err){
            if(err) return console.log(err);

        
          deptagent.update({agentid : gotAgent._id, companyid : clientUser.uniqueid},
            {deleteStatus : 'Yes'}, {multi : true}, function(err){
              if(err) return console.log(err);

                  groupagent.update({agentid : gotAgent._id, companyid : clientUser.uniqueid},
                                {deleteStatus : 'Yes'}, {multi : true}, function(err2){
                                  if(err) return console.log(err2);

                                  User.find({uniqueid : clientUser.uniqueid, isDeleted: 'No'}, function(err3,gotAgents){
                                    if(err) return console.log(err3);

                                    res.send({status: 'success', msg: gotAgents});

                                  })


                                })
                //res.send({status: 'success', msg: gotAgents});

              


            })



          })


        })
      })
    }
    else if(gotUser.isAdmin == 'Yes'){

      User.findById(req.params.id, function(err, gotAgent){
        if(err) return console.log(err);

        var today = new Date();
        var agentDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

        gotAgent.isDeleted = 'Yes';
        gotAgent.email = 'deleted '+ agentDeleteDate+ ' '+ gotAgent.email;

        gotAgent.save(function(err){
          if(err) return console.log(err);

          deptagent.update({agentid : gotAgent._id, companyid : gotUser.uniqueid},
            {deleteStatus : 'Yes'}, {multi : true}, function(err){
              if(err) return console.log(err);

                  groupagent.update({agentid : gotAgent._id, companyid : gotUser.uniqueid},
                                {deleteStatus : 'Yes'}, {multi : true}, function(err2){
                                  if(err) return console.log(err2);

                                  User.find({uniqueid : gotUser.uniqueid, isDeleted: 'No'}, function(err3,gotAgents){
                                    if(err) return console.log(err3);

                                    res.send({status: 'success', msg: gotAgents});

                                  })


                                })
                //res.send({status: 'success', msg: gotAgents});

              


            })

        })


      })

    }
    else
      res.json(501, {});
  })
};

/**
 * Update User Image
 */
exports.updateimage = function(req, res, next){
  console.log(req.files);
  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log('Error 1'+ err);

    if(gotUser.picture == null)
    {
      var today = new Date();
      var uid = crypto.randomBytes(5).toString('hex');
      var serverPath = '/' + 'f' + uid + '' + today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate();
      serverPath += '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();
      serverPath += '.' + req.files.file.type.split('/')[1];

      console.log(__dirname);

      var dir = "./userpictures";

      if(req.files.file.size == 0) return res.send('No file submitted');

      require('fs').rename(
        req.files.file.path,
        dir + "/" + serverPath,
        function(error) {
          if(error) {
            console.log('user.controller (update image) : '+ error);
            res.send({
              error: 'Server Error: Could not upload the file'
            });
            return 0;
          }
        }

      );

      gotUser.picture = serverPath;

      gotUser.save(function (err2) {
        if (err2) return console.log('Error 2'+ err2);

        User.findById(gotUser, function (err, gotUserSaved) {

          res.json(gotUserSaved);
          //res.redirect('/home');

        })

      });
      console.log("saved image")

    }
    else
    {
      var dir = './userpictures';
      dir += gotUser.picture;

      if(gotUser.picture)
      {
        require('fs').unlink(dir, function (err) {
          if (err) {
            console.log('user.controller (update image) : '+ err);
            //throw err;
          }


          var today = new Date();
          var uid = crypto.randomBytes(5).toString('hex');
          var serverPath = '/' + 'f' + uid + '' + today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate();
          serverPath += '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();
          serverPath += '.' + req.files.file.type.split('/')[1];

          var dir = './userpictures';

          if(req.files.file.size == 0) return res.send('No file submitted');

          require('fs').rename(
            req.files.file.path,
            dir + "/" + serverPath,
            function(error) {
              if(error) {
                console.log('error', 'user.controller (update image 2) : '+ error);
                res.send({
                  error: 'Server Error: Could not upload the file'
                });
                return 0;
              }
            }
          );

          gotUser.picture = serverPath;

          gotUser.save(function (err2) {
            if (err2) return console.log('Error 2'+ err2);

            User.findById(gotUser, function (err, gotUserSaved) {

              res.json(gotUserSaved);
              //res.redirect('/home');

            })

          });


        })
      }
    }


  })
};

/**
 * Get User Image
 */
exports.userimage = function(req, res, next) {
  res.sendfile(req.params.image, {root: './userpictures'});
};

/**
 * Update the rights for the supervisor
 */
exports.updaterightsforsuperuser = function(req, res) {
  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(gotUser.isAdmin == 'Yes' || gotUser.role === 'owner'){

      User.findById(req.body.personid, function(err2, gotOption2){
        if (err2) return console.log(err2);

        if(req.body.options.includeRightOption == 'Yes'){
          gotOption2.canIncludeAgent = 'Yes';
        }
        else{
          gotOption2.canIncludeAgent = 'No';
        }

        if(req.body.options.excludeRightOption == 'Yes'){
          gotOption2.canExcludeAgent = 'Yes';
        }
        else{
          gotOption2.canExcludeAgent = 'No';
        }

        gotOption2.save(function(err3){
          if(err3) return console.log(err3)

          res.send({status:'success', msg:gotOption2})
        })
      })
    }
    else
      res.json(501, {});
  })
};


/**
 * Update the role of the user
 */
exports.updaterole = function(req, res) {
  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(gotUser.isAdmin == 'Yes'){

      User.findById(req.body.personid, function(err2, gotPerson){
        if (err2) return console.log(err2);

        if(req.body.role == 'Agent'){
          gotPerson.isAgent = 'Yes';
          gotPerson.isAdmin = 'No';
          gotPerson.isSupervisor = 'No';
        }
        else if(req.body.role == 'Admin'){
          gotPerson.isAgent = 'No';
          gotPerson.isAdmin = 'Yes';
          gotPerson.isSupervisor = 'No';
        }
        else{
          gotPerson.isAgent = 'No';
          gotPerson.isAdmin = 'No';
          gotPerson.isSupervisor = 'Yes';
          gotPerson.canExcludeAgent = 'Yes';
          gotPerson.canIncludeAgent = 'Yes';
        }

        gotPerson.save(function(err3){
          if(err3) return console.log(err3)

          res.send({status:'success', msg:gotPerson})

        })

      })

    }
    else
      res.json(501, {});

  })
};

/**
 * Update the profile of the user
 */
exports.updateprofile = function(req, res) {
  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    gotUser.firstname = req.body.firstname;
    gotUser.lastname = req.body.lastname;
    gotUser.phone = req.body.phone;
    gotUser.city = req.body.city;
    gotUser.state = req.body.state;
    gotUser.country = req.body.country;

    gotUser.save(function(err2){
      if(err2) return console.log(err2)
      res.send({status:'success', msg:gotUser})
    })

  })
};




/**
 * Update the profile picture of the user
 */
exports.updateprofilepicture = function(req, res) {
  console.log('updateprofilepicture is called');
  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    gotUser.picture = req.body.picture;


    gotUser.save(function(err2){
      if(err2) return console.log(err2)
      res.send({status:'success', msg:gotUser})
    })

  })
};


/**
 * Request for changing the password by user
 */
exports.requestpasswordchange = function(req, res) {
  User.findOne({email : req.body.email, website : req.body.website.toLowerCase()}, function(err, gotUser){

    if(err) return console.log(err)
    if(!gotUser) return res.send({status:'danger', msg:'Sorry! No such account or company exists in our database.'})

    var tokenString = crypto.randomBytes(15).toString('hex');

    var newToken = new passwordresettoken({
      user : gotUser._id,
      token : tokenString
    });

    newToken.save(function(err){
      if (err) return console.log(err)
    });

    configuration.findOne({}, function(err, gotConfig) {

      var sendgrid  = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

      var email     = new sendgrid.Email({
        to:       gotUser.email,
        from:     'support@cloudkibo.com',
        subject:  'KiboSupport: Password Reset',
        text:     'Password Reset'
      });

      email.setHtml('<h1>KiboSupport</h1><br><br>Use the following link to change your password <br><br> http://api.kibosupport.com/resetpassword/'+ tokenString);

      sendgrid.send(email, function(err, json) {
        if (err) { return console.error(err); }

        // console.log(json);

        res.send({status:'success', msg:'Password Reset Link has been sent to your email address. Check your spam or junk folder if you have not received our email.'});

      });
    });

  })
};



/****** For kiboengage,creating a separate function:since email template will be change
*/
exports.requestpasswordchangeKiboEngage = function(req, res) {
  User.findOne({email : req.body.email, website : req.body.website.toLowerCase()}, function(err, gotUser){

    if(err) return console.log(err)
    if(!gotUser) return res.send({status:'danger', msg:'Sorry! No such account or company exists in our database.'})

    var tokenString = crypto.randomBytes(15).toString('hex');

    var newToken = new passwordresettoken({
      user : gotUser._id,
      token : tokenString
    });

    newToken.save(function(err){
      if (err) return console.log(err)
    });

    configuration.findOne({}, function(err, gotConfig) {

      var sendgrid  = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

      var email     = new sendgrid.Email({
        to:       gotUser.email,
        from:     'support@cloudkibo.com',
        subject:  'KiboEngage: Password Reset',
        text:     'Password Reset'
      });

      email.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
              '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
              '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
              '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
              '<p style="color: #ffffff"> KiboEngage - Reset Password </p> </td></tr> </table> </td> </tr> </table> ' +
              '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
              '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
              '<tr> <td class="wrapper last"> <p> Hello, <br> This is to inform you that you have requested to change your password for your KiboEngage account </p> <p> </p>  <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
              '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> </td> <td class="expander"> </td> </tr> </table> <p> Use the following link to change your password <br><br> https://kiboengage.kibosupport.com/resetpassword/'+ tokenString +' </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
              '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')

      sendgrid.send(email, function(err, json) {
        if (err) { return console.error(err); }

        // console.log(json);

        res.send({status:'success', msg:'Password Reset Link has been sent to your email address. Check your spam or junk folder if you have not received our email.'});

      });
    });

  })
};



/**
 * Change the user password
 */
exports.changepassword = function(req, res) {
  console.log(req.body)
  var token = req.body.token;

  passwordresettoken.findOne({token: token}, function (err, doc){
    if (err) return done(err);
    if(!doc) return res.send(404);

    User.findOne({_id: doc.user}, function (err, user) {
      if (err) return done(err);
      if (!user) return res.send(501);

      user.password = String(req.body.password);
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send('Password Successfully Changed. Please login with your new password');
      });
    })

  })
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {

  if(typeof req.body.token=== 'undefined' ){
    var accountData;

    var today = new Date();

    var uid = crypto.randomBytes(5).toString('hex');
    var unique_id = 'c' + uid + '' + today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

    configuration.findOne({}, function (err, gotConfig) {
      if(err) return console.log(err);
      accountData = new User({
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        email : req.body.email,
        phone : req.body.phone,
        website : req.body.website.toLowerCase(),
        companyName : req.body.companyName,
        password : req.body.password,
        uniqueid : unique_id,
        isAdmin : 'Yes',
        isAgent : 'No',
        canIncludeAgent : 'Yes',
        canExcludeAgent : 'Yes',
        isSupervisor : 'No',
        abandonedemail1 : gotConfig.abandonedscheduleemail1,
        abandonedemail2 : gotConfig.abandonedscheduleemail2,
        abandonedemail3 : gotConfig.abandonedscheduleemail3,
        completedemail1 : gotConfig.completedscheduleemail1,
        completedemail2 : gotConfig.completedscheduleemail2,
        completedemail3 : gotConfig.completedscheduleemail3,
        invitedemail1 : gotConfig.invitedscheduleemail1,
        invitedemail2 : gotConfig.invitedscheduleemail2,
        invitedemail3 : gotConfig.invitedscheduleemail3
      });

      var companyprofileData = new companyprofile({
        companyid : unique_id,
        isdomainemail : 'No',
        abandonedscheduleemail1 : gotConfig.abandonedscheduleemail1,
        abandonedscheduleemail2 : gotConfig.abandonedscheduleemail2,
        abandonedscheduleemail3 : gotConfig.abandonedscheduleemail3,
        completedscheduleemail1 : gotConfig.completedscheduleemail1,
        completedscheduleemail2 : gotConfig.completedscheduleemail2,
        completedscheduleemail3 : gotConfig.completedscheduleemail3,
        invitedscheduleemail1 : gotConfig.invitedscheduleemail1,
        invitedscheduleemail2 : gotConfig.invitedscheduleemail2,
        invitedscheduleemail3 : gotConfig.invitedscheduleemail3,
        maxnumberofdepartment : gotConfig.maxnumberofdepartment,
        completeCallTime: gotConfig.completeCallTime,
        allowCompletingOfCalls: gotConfig.allowCompletingOfCalls,
        smsphonenumber: req.body.phone,
        notificationemailaddress: req.body.email
      });

      //console.log(req.body)
      accountData.save(function(err, user) {
        if (err) console.log(err);
        if (err) return validationError(res, err);

        var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
        res.json({ token: token });

        companyprofileData.save(function(err){
          if(err) console.log(err);

          var tokenString = crypto.randomBytes(12).toString('hex');

          var newToken = new verificationtoken({
            user : user._id,
            token : tokenString
          });

          newToken.save(function(err){
            if (err) return console.log(err)
          });

          /*
           var news = otherSchemas.news

           var currentNews = new news({
           label : 'Registration',
           content : ''+ req.user.username +' has made an account on CloudKibo.',
           userid : req.user._id,
           datetime : Date.now
           });

           currentNews.save(function (err) {
           if (err) console.log(err)
           })
           */

          configuration.findOne({}, function(err, gotConfig) {

            var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

            var email     = new sendgrid.Email({
              to:       req.body.email,
              from:     'support@cloudkibo.com',
              subject:  'KiboSupport: Account Verification',
              text:     'Welcome to KiboSupport'
            });

            email.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
              '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
              '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
              '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
              '<p style="color: #ffffff">Verify your account</p> </td></tr> </table> </td> </tr> </table> ' +
              '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
              '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
              '<tr> <td class="wrapper last"> <p> Hello, <br> Thank you for joining Kibosupport. <br>Use the following link to verify your account <br>  </p> <p>To accept invitation please click the following URL to activate your account:</p> <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
              '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> <a href="https://api.kibosupport.com/verification/'+ tokenString +'"> https://api.kibosupport.com/verification/'+ tokenString +'</a> </td> <td class="expander"> </td> </tr> </table> <p> If clicking the URL above does not work, copy and paste the URL into a browser window. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
              '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')


            email.setHtml('<h1>KiboSupport</h1><br><br>Use the following link to verify your account <br><br> <a href="https://api.kibosupport.com/verification/'+ tokenString +'"> https://api.kibosupport.com/verification/'+ tokenString +'</a>');

            sendgrid.send(email, function(err, json) {
              if (err) { return console.log(err); }
              //console.log(json);
            });

            var email2     = new sendgrid.Email({
              to:       'shabir.saba@gmail.com',
              from:     'support@cloudkibo.com',
              subject:  'KiboSupport: Account created by '+ req.body.website.toLowerCase(),
              text:     'Welcome to KiboSupport'
            });

            //email2.setHtml('<h1>KiboSupport</h1><br><br>The following domain has created an account with KiboSupport. <br><br> <b>Domain Name: </b>'+ req.body.website);

            email2.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
              '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
              '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
              '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
              '<p style="color: #ffffff"> New account created on Kibosupport. </p> </td></tr> </table> </td> </tr> </table> ' +
              '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
              '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
              '<tr> <td class="wrapper last"> <p> Hello, <br> This is to inform you that following domain has creater an account with Kibosuppport  </p> <p> <ul> <li>Domain Name: '+req.body.website.toLowerCase()+'</li> ' +
              '<li>Name: '+ req.body.firstname+' '+req.body.lastname+ '</li><li>Company Name: '+req.body.companyName +' </li> </ul> </p>  <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
              '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> </td> <td class="expander"> </td> </tr> </table> <p> Login now on KiboSupport to see account details. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
              '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')

            sendgrid.send(email2, function(err, json) {
              if (err) { return console.log(err); }
              //console.log(json);
            });

          });

        });



      });


    });
  }
  else {
    // This is the agent joining company

    var token = req.body.token;

    inviteagenttoken.findOne({token: token}, function (err, doc){
      if (err) return done(err);
      if(!doc) return res.send(501);

      User.findOne({uniqueid : doc.companyId, isAdmin: "Yes"}, function(err, gotWebsiteData) {
        if(req.body.website !== gotWebsiteData.website.toLowerCase()) return res.json(501, {errors : [{message : 'You have entered the wrong domain name.'}]})
        var accountData;
        accountData = new User({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          phone: req.body.phone,
          website: gotWebsiteData.website.toLowerCase(),
          uniqueid: doc.companyId,
          companyName: gotWebsiteData.companyName,
          password : req.body.password,
          isAgent: 'Yes',
          isAdmin: 'No',
          isSupervisor: 'No',
          abandonedemail1: gotWebsiteData.abandonedemail1,
          abandonedemail2: gotWebsiteData.abandonedemail2,
          abandonedemail3: gotWebsiteData.abandonedemail3,
          completedemail1: gotWebsiteData.completedemail1,
          completedemail2: gotWebsiteData.completedemail2,
          completedemail3: gotWebsiteData.completedemail3,
          invitedemail1: gotWebsiteData.invitedemail1,
          invitedemail2: gotWebsiteData.invitedemail2,
          invitedemail3: gotWebsiteData.invitedemail3
        });

        accountData.save(function (err, user) {
          if (err) console.log(err);
          if (err) return validationError(res, err);

          var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresInMinutes: 60 * 5});
          res.json({token: token});

          var tokenString = crypto.randomBytes(12).toString('hex');

          var newToken = new verificationtoken({
            user: user._id,
            token: tokenString
          });

          newToken.save(function (err) {
            if (err) return console.log(err)
          });

          /*
           var news = otherSchemas.news

           var currentNews = new news({
           label : 'Registration',
           content : ''+ req.user.username +' has made an account on CloudKibo.',
           userid : req.user._id,
           datetime : Date.now
           });

           currentNews.save(function (err) {
           if (err) console.log(err)
           })
           */

          configuration.findOne({}, function(err, gotConfig) {

            var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

            var email = new sendgrid.Email({
              to: req.body.email,
              from: 'support@cloudkibo.com',
              subject: 'KiboSupport: Account Verification',
              text: 'Welcome to KiboSupport'
            });

            //email.setHtml('<h1>KiboSupport</h1><br><br>Use the following link to verify your account <br><br> <a href="https://api.kibosupport.com/verification/' + tokenString + '"> https://api.kibosupport.com/verification/' + tokenString + '</a>');

            email.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
              '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
              '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
              '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
              '<p style="color: #ffffff">Verify your account on Kibosupport.</p> </td></tr> </table> </td> </tr> </table> ' +
              '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
              '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
              '<tr> <td class="wrapper last"> <p> Hello, <br> You account has been created on Kibosuppport. Please use the following link to verify your account   </p> <p><br><br> <a href="https://api.kibosupport.com/verification/' + tokenString + '"> https://api.kibosupport.com/verification/' + tokenString + '</a> </p>  <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
              '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> </td> <td class="expander"> </td> </tr> </table> <p> For any queries contact us on support@cloudkibo.com. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
              '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')

            sendgrid.send(email, function (err, json) {
              if (err) {
                return console.log(err);
              }
              //console.log(json);
            });

            var email2 = new sendgrid.Email({
              to: 'shabir.saba@gmail.com',
              from: 'support@cloudkibo.com',
              subject: 'KiboSupport: Account created by ' + req.body.firstname + ' on '+gotWebsiteData.website.toLowerCase(),
              text: 'Welcome to KiboSupport'
            });

            email2.setHtml('<h1>KiboSupport</h1><br><br>The following domain has created an account with KiboSupport. <br><br> <b>Domain Name: </b>' + gotWebsiteData.website.toLowerCase());

            sendgrid.send(email2, function (err, json) {
              if (err) {
                return console.log(err);
              }
              //console.log(json);
            });

            tempaccount.remove({email : req.body.email}, function(err){
              return console.log(err);
            });

          });




        });

      });



    });
  }



};






/**
 * Creates a new KiboEngage user
 */
exports.createKiboEngageUser = function (req, res, next) {

  if(typeof req.body.token=== 'undefined' ){
    var accountData;

    var today = new Date();

    var uid = crypto.randomBytes(5).toString('hex');
    var unique_id = 'c' + uid + '' + today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

    configuration.findOne({}, function (err, gotConfig) {
      if(err) return console.log(err);
      accountData = new User({
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        email : req.body.email,
        phone : req.body.phone,
        website : req.body.website.toLowerCase(),
        companyName : req.body.companyName,
        password : req.body.password,
        uniqueid : unique_id,
        isAdmin : 'Yes',
        isAgent : 'No',
        canIncludeAgent : 'Yes',
        canExcludeAgent : 'Yes',
        isSupervisor : 'No',
        abandonedemail1 : gotConfig.abandonedscheduleemail1,
        abandonedemail2 : gotConfig.abandonedscheduleemail2,
        abandonedemail3 : gotConfig.abandonedscheduleemail3,
        completedemail1 : gotConfig.completedscheduleemail1,
        completedemail2 : gotConfig.completedscheduleemail2,
        completedemail3 : gotConfig.completedscheduleemail3,
        invitedemail1 : gotConfig.invitedscheduleemail1,
        invitedemail2 : gotConfig.invitedscheduleemail2,
        invitedemail3 : gotConfig.invitedscheduleemail3
      });

      // when a new company is created , we will create a Team 'All'
      var companyprofileData = new companyprofile({
        companyid : unique_id,
        isdomainemail : 'No',
        abandonedscheduleemail1 : gotConfig.abandonedscheduleemail1,
        abandonedscheduleemail2 : gotConfig.abandonedscheduleemail2,
        abandonedscheduleemail3 : gotConfig.abandonedscheduleemail3,
        completedscheduleemail1 : gotConfig.completedscheduleemail1,
        completedscheduleemail2 : gotConfig.completedscheduleemail2,
        completedscheduleemail3 : gotConfig.completedscheduleemail3,
        invitedscheduleemail1 : gotConfig.invitedscheduleemail1,
        invitedscheduleemail2 : gotConfig.invitedscheduleemail2,
        invitedscheduleemail3 : gotConfig.invitedscheduleemail3,
        maxnumberofdepartment : gotConfig.maxnumberofdepartment,
        completeCallTime: gotConfig.completeCallTime,
        allowCompletingOfCalls: gotConfig.allowCompletingOfCalls,
        smsphonenumber: req.body.phone,
        notificationemailaddress: req.body.email
      });

      //console.log(req.body)
      accountData.save(function(err, user) {
        if (err) console.log(err);
        if (err) return validationError(res, err);

        var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
        res.json({ token: token });

        companyprofileData.save(function(err){
          if(err) console.log(err);

          var tokenString = crypto.randomBytes(12).toString('hex');
          // when a new company is created , we will create a Team 'All'
          var newGroup = new Group({
          groupname : 'All',
          groupdescription: 'General Team. All agents will be a part of this team',
          companyid : unique_id,
          createdby : user._id,
          status : 'public',
        });

          newGroup.save(function(err,group){
            if (err) return console.log(err)
            //we will also add agent in group 'ALL' when he signsup
               var newgroupagent = new groupagent({
                  groupid : group._id,
                  companyid : unique_id,
                  agentid : user._id,
                });

                newgroupagent.save(function(err4){
                  if(err4) return console.log(err4)
                })
          });


          var newToken = new verificationtoken({
            user : user._id,
            token : tokenString
          });

          newToken.save(function(err){
            if (err) return console.log(err)
          });
          configuration.findOne({}, function(err, gotConfig) {

            var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

            var email     = new sendgrid.Email({
              to:       req.body.email,
              from:     'support@cloudkibo.com',
              subject:  'KiboEngage: Account Verification',
              text:     'Welcome to KiboEngage'
            });

            email.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
              '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
              '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
              '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
              '<p style="color: #ffffff">Verify your account</p> </td></tr> </table> </td> </tr> </table> ' +
              '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
              '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
              '<tr> <td class="wrapper last"> <p> Hello, <br> Thank you for joining KiboEngage. <br>Use the following link to verify your account <br>  </p> <p>To accept invitation please click the following URL to activate your account:</p> <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
              '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> <a href="https://kiboengage.kibosupport.com/verification/'+ tokenString +'">https://kiboengage.kibosupport.com/verification/'+ tokenString +'</a> </td> <td class="expander"> </td> </tr> </table> <p> If clicking the URL above does not work, copy and paste the URL into a browser window. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
              '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')

            sendgrid.send(email, function(err, json) {
              if (err) { return console.log(err); }
              //console.log(json);
            });

            var email2     = new sendgrid.Email({
              to:       'sojharo@gmail.com',
              from:     'support@cloudkibo.com',
              subject:  'KiboEngage: Account created by '+ req.body.website.toLowerCase(),
              text:     'Welcome to KiboEngage'
            });

            //email2.setHtml('<h1>KiboSupport</h1><br><br>The following domain has created an account with KiboSupport. <br><br> <b>Domain Name: </b>'+ req.body.website);

            email2.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
              '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
              '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
              '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
              '<p style="color: #ffffff"> New account created on KiboEngage. </p> </td></tr> </table> </td> </tr> </table> ' +
              '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
              '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
              '<tr> <td class="wrapper last"> <p> Hello, <br> This is to inform you that following domain has creater an account with KiboEngage  </p> <p> <ul> <li>Domain Name: '+req.body.website.toLowerCase()+'</li> ' +
              '<li>Name: '+ req.body.firstname+' '+req.body.lastname+ '</li><li>Company Name: '+req.body.companyName +' </li> </ul> </p>  <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
              '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> </td> <td class="expander"> </td> </tr> </table> <p> Login now on KiboEngage to see account details. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
              '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')

            sendgrid.send(email2, function(err, json) {
              if (err) { return console.log(err); }
              //console.log(json);
            });

          });

        });



      });


    });
  }
  else {
    // This is the agent joining company

    var token = req.body.token;

    inviteagenttoken.findOne({token: token}, function (err, doc){
      if (err) return done(err);
      if(!doc) return res.send(501);

      User.findOne({uniqueid : doc.companyId, isAdmin: "Yes"}, function(err, gotWebsiteData) {
        if(req.body.website !== gotWebsiteData.website.toLowerCase()) return res.json(501, {errors : [{message : 'You have entered the wrong domain name.'}]})
        var accountData;
        accountData = new User({
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          phone: req.body.phone,
          website: gotWebsiteData.website.toLowerCase(),
          uniqueid: doc.companyId,
          companyName: gotWebsiteData.companyName,
          password : req.body.password,
          isAgent: 'Yes',
          isAdmin: 'No',
          isSupervisor: 'No',
          abandonedemail1: gotWebsiteData.abandonedemail1,
          abandonedemail2: gotWebsiteData.abandonedemail2,
          abandonedemail3: gotWebsiteData.abandonedemail3,
          completedemail1: gotWebsiteData.completedemail1,
          completedemail2: gotWebsiteData.completedemail2,
          completedemail3: gotWebsiteData.completedemail3,
          invitedemail1: gotWebsiteData.invitedemail1,
          invitedemail2: gotWebsiteData.invitedemail2,
          invitedemail3: gotWebsiteData.invitedemail3
        });

        accountData.save(function (err, user) {
          if (err) console.log(err);
          if (err) return validationError(res, err);

          var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresInMinutes: 60 * 5});
          res.json({token: token});

          var tokenString = crypto.randomBytes(12).toString('hex');

          var newToken = new verificationtoken({
            user: user._id,
            token: tokenString
          });

          newToken.save(function (err) {
            if (err) return console.log(err)
          });

          group.findOne({groupname:'All',companyid:doc.companyId}, function(err, group){
          // add the agent in Team 'ALL'
            var newgroupagent = new groupagent({
                  groupid : group._id,
                  companyid : group.companyid,
                  agentid : user._id,
                });

            newgroupagent.save(function(err4){
                  if(err4) return console.log(err4)
                })
          });

          configuration.findOne({}, function(err, gotConfig) {

            var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

            var email = new sendgrid.Email({
              to: req.body.email,
              from: 'support@cloudkibo.com',
              subject: 'KiboEngage: Account Verification',
              text: 'Welcome to KiboEngage'
            });


            email.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
              '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
              '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
              '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
              '<p style="color: #ffffff">Verify your account on KiboEngage.</p> </td></tr> </table> </td> </tr> </table> ' +
              '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
              '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
              '<tr> <td class="wrapper last"> <p> Hello, <br> You account has been created on KiboEngage. Please use the following link to verify your account   </p> <p><br><br> <a href="https://kiboengage.kibosupport.com/verification/' + tokenString + '">https://kiboengage.kibosupport.com/verification/' + tokenString + '</a> </p>  <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
              '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> </td> <td class="expander"> </td> </tr> </table> <p> For any queries contact us on support@cloudkibo.com. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
              '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')

            sendgrid.send(email, function (err, json) {
              if (err) {
                return console.log(err);
              }
              //console.log(json);
            });

            var email2 = new sendgrid.Email({
              to: 'shabir.saba@gmail.com',
              from: 'support@cloudkibo.com',
              subject: 'KiboEngage: Account created by ' + req.body.firstname + ' on '+gotWebsiteData.website.toLowerCase(),
              text: 'Welcome to KiboEngage'
            });

            email2.setHtml('<h1>KiboEngage</h1><br><br>The following domain has created an account with KiboEngage. <br><br> <b>Domain Name: </b>' + gotWebsiteData.website.toLowerCase());

            sendgrid.send(email2, function (err, json) {
              if (err) {
                return console.log(err);
              }
              //console.log(json);
            });

            tempaccount.remove({email : req.body.email}, function (err) {
              if (err) return console.log(err);
              inviteagenttoken.remove({ token: token }, function (err) {
                if (err) return console.log(err);
              });
            });

          });




        });

      });



    });
  }



};


/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Re-apply for verification link
 */

exports.reapplyverificationlink = function(req, res) {

  var tokenString = crypto.randomBytes(12).toString('hex');

  var newToken = new verificationtoken({
    user : req.user._id,
    token : tokenString
  });

  newToken.save(function(err){
    if (err) return console.log(err)
  });

  configuration.findOne({}, function(err, gotConfig) {

    var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

    var email     = new sendgrid.Email({
      to:       req.user.email,
      from:     'support@cloudkibo.com',
      subject:  'KiboSupport: Account Verification',
      text:     'Welcome to KiboSupport'
    });

    email.setHtml('<h1>KiboSupport</h1><br><br>Use the following link to verify your account <br><br> https://api.kibosupport.com/verification/'+ tokenString);

    sendgrid.send(email, function(err, json) {
      if (err) { return console.log(err); }
      console.log(json);
    });

    res.send(200);

  });

};




/** KiboEngage
**/

exports.reapplyverificationlinkKiboEngage = function(req, res) {

  var tokenString = crypto.randomBytes(12).toString('hex');

  var newToken = new verificationtoken({
    user : req.user._id,
    token : tokenString
  });

  newToken.save(function(err){
    if (err) return console.log(err)
  });

  configuration.findOne({}, function(err, gotConfig) {

    var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

    var email     = new sendgrid.Email({
      to:       req.user.email,
      from:     'support@cloudkibo.com',
      subject:  'KiboEngage: Account Verification',
      text:     'Welcome to KiboEngage'
    });

    email.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
              '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
              '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
              '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
              '<p style="color: #ffffff">Verify your account</p> </td></tr> </table> </td> </tr> </table> ' +
              '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
              '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
              '<tr> <td class="wrapper last"> <p> Hello, <br> Thank you for joining KiboEngage. <br>Use the following link to verify your account <br>  </p> <p>To accept invitation please click the following URL to activate your account:</p> <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
              '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> <a href="https://kiboengage.kibosupport.com/verification/'+ tokenString +'">https://kiboengage.kibosupport.com/verification/'+ tokenString +'</a> </td> <td class="expander"> </td> </tr> </table> <p> If clicking the URL above does not work, copy and paste the URL into a browser window. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
              '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')

    sendgrid.send(email, function(err, json) {
      if (err) { return console.log(err); }
      console.log(json);
    });

    res.send(200);

  });

};


/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {

  User.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if (gotUser.isOwner == 'Yes'){

      User.findById(req.params.id, function (err2, gotAccount) {
        if (err2) return console.log(err2);


        visitorcalls.remove({room : gotAccount.uniqueid}, function (err3){
          if(err3) return console.log(err3);
          //console.log('Removed from visitor calls table')

          User.remove({_id : gotAccount._id}, function(err4){
            if(err4) return console.log(err4);
            //console.log('Removed from account calls table')
            res.send(200);
          })
        })

      })
    }
    else{
      res.send(501);
    }
  });
};

/**
 * Reset user password from settings
 */
exports.resetpassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.password);
  var newPass = String(req.body.newpassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};
/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
