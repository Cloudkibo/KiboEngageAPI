'use strict';

var _ = require('lodash');
var Tempaccount = require('./tempaccount.model');
var user = require('../user/user.model');
var inviteagenttoken = require('../inviteagenttoken/inviteagenttoken.model');
var configuration = require('../configuration/configuration.model');

// Get list of pending agents
exports.index = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Tempaccount.find({uniqueid : clientUser.uniqueid}, function (err, tempaccounts) {
        if(err) { return handleError(res, err); }
        return res.json(200, tempaccounts);
      });
    })
  } else if(req.user.isAdmin == 'Yes'){

    Tempaccount.find({uniqueid : req.user.uniqueid}, function (err, tempaccounts) {
      if(err) { return handleError(res, err); }
      return res.json(200, tempaccounts);
    });

  }
  else
    res.send({status: 501});

};

// Get a single tempaccount
exports.show = function(req, res) {
  Tempaccount.findOne({_id: req.params.id, uniqueid : req.user.uniqueid}, function (err, tempaccount) {
    if(err) { return handleError(res, err); }
    if(!tempaccount) { return res.send(404); }
    return res.json(tempaccount);
  });
};

// Creates a new tempaccount in the DB and invite the agent to the call
exports.create = function(req, res) {

  configuration.findOne({}, function (err, gotConfig) {
    if (err) return console.log(err);

    user.count({uniqueid : req.user.uniqueid}, function(err, gotCountMembers) {
      if (err) return console.log(err);

      if(gotCountMembers === gotConfig.maxnumberofagent){
        res.send({status: 'danger', msg: 'You can not have more than '+ gotCountMembers +' members in your team.'});
      }
      else{
        Tempaccount.count({email : req.body.email.toLowerCase(), uniqueid : req.user.uniqueid}, function(err, gotCount){
          if(err) return console.log(err);

          if(gotCount > 0){
            res.send({status: 'danger', msg: 'This person is already invited'});
          }
          else{

            user.count({email : req.body.email.toLowerCase(), uniqueid : req.user.uniqueid}, function(err, gotCountAgent){
              if(err) return console.log(err);

              if(gotCountAgent > 0){
                res.send({status: 'danger', msg: 'This person is already member'});
              }else {
                var today = new Date();
                var uid = Math.random().toString(36).substring(7);
                var uniqueToken_id = 'k' + uid + '' + today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

                var inviteeData = new inviteagenttoken({
                  email : req.body.email,
                  token : uniqueToken_id,
                  companyId : req.user.uniqueid
                });

                inviteeData.save(function(err){
                  if(err) console.log(err);
                });

                var inviteeTempData = new Tempaccount({
                  email : req.body.email.toLowerCase(),
                  uniqueid : req.user.uniqueid
                });

                inviteeTempData.save(function(err){
                  if(err) console.log(err);
                });

                configuration.findOne({}, function(err, gotConfig) {

                  console.log(gotConfig);

                  var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

                  var email     = new sendgrid.Email({
                    to:       req.body.email,
                    from:     'support@cloudkibo.com',
                    subject:  'KiboSupport: Invitation',
                    text:     'Welcome to KiboSupport'
                  });

                  /*
                  email.setHtml('<h4><a href="https://api.kibosupport.com">KiboSupport</a></h4><br> Hi there, <br>You have been invited to join '+
                  + req.user.website +' as a Support Agent. This invitation has been sent by Mr./Ms '+ req.user.firstname +' '+ req.user.lastname +'.<br> To accept the invitation and signup please go to following link:'+
                  ' <br><a href="https://api.kibosupport.com/joincompany/'+ uniqueToken_id +'"> https://api.kibosupport.com/joincompany/' + uniqueToken_id +
                  ' </a><br><br>'+
                  '</b><br><br><small>If this email was not intended for you, please ignore it.</small>');

                  */


                  /*email.setHtml('<table class=\"container content\" align=\"center\"><tbody><tr><td><table class=\"row note\"><tbody><tr><td class=\"wrapper last\"><h4>Inviting you as a Kibosupport Agent</h4>'+
                  '<p> Hi there, <br>'+ req.user.firstname +' '+ req.user.lastname +' has invited you to join '+req.user.website+' as a Support Agent. To accept invitation please click the following URL to activate your account:</p>'+
                  '<table class=\"twelve columns\" style=\"margin-bottom:10px \"><tbody><tr><td class=\"panel\"><a href="https://api.kibosupport.com/joincompany/'+ uniqueToken_id +'">https://api.kibosupport.com/joincompany/' + uniqueToken_id +
                  '</td><td class=\"expander\"></td></tr></tbody></table><p>If clicking the URL above does not work, copy and paste the URL into a browser window. If this email was not intended for you, please ignore it.</p>'+
                  '</td></tr></tbody></table><span class=\"devider\"></span></td></tr></tbody></table>')
                          */
                  email.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
                    '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
                    '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
                    '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
                    '<p style="color: #ffffff">Inviting you as support agent</p> </td></tr> </table> </td> </tr> </table> ' +
                    '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
                    '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
                    '<tr> <td class="wrapper last"> <p> Hello, <br> '+ req.user.firstname +' '+ req.user.lastname +' has invited you to join '+req.user.website+' as a Support Agent.</p> <p> <ul> <li>Company Name: '+req.user.companyName+'</li> ' +
                    '<li>Company Domain: '+ req.user.website+' </li> </ul> </p> <p>To accept invitation please click the following URL to activate your account:</p> <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
                    '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> <a href="https://api.kibosupport.com/joincompany/'+ uniqueToken_id +'">https://api.kibosupport.com/joincompany/'+ uniqueToken_id + '</a> </td> <td class="expander"> </td> </tr> </table> <p> If clicking the URL above does not work, copy and paste the URL into a browser window. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
                    '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')
                  sendgrid.send(email, function(err, json) {
                    if (err) { return console.log(err); }

                    return res.send({status: 'success', msg: 'Email has been sent'});

                  });

                });
              }

            });


          }

        })

      }

    });
  });


};

// Updates an existing tempaccount in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Tempaccount.findById(req.params.id, function (err, tempaccount) {
    if (err) { return handleError(res, err); }
    if(!tempaccount) { return res.send(404); }
    var updated = _.merge(tempaccount, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, tempaccount);
    });
  });
};

// Deletes a tempaccount from the DB.
exports.destroy = function(req, res) {
  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(gotUser.isAdmin == 'Yes' || gotUser.role === 'owner'){

      Tempaccount.remove({email: req.params.id}, function(err){
        if(err) return console.log(err);

        res.send({status:'success', msg:'Agent request has been deleted'});

        inviteagenttoken.remove({email: req.params[0]}, function(err){
          if(err) console.log(err);
        })
      })

    }
    else
      res.json(501, {});
  })
};

function handleError(res, err) {
  return res.send(500, err);
}



/********************* For kibo Engage *********************/

// Creates a new tempaccount in the DB and invite the agent to the call
exports.createKiboEngage = function(req, res) {

  configuration.findOne({}, function (err, gotConfig) {
    if (err) return console.log(err);

    user.count({uniqueid : req.user.uniqueid}, function(err, gotCountMembers) {
      if (err) return console.log(err);

      if(gotCountMembers === gotConfig.maxnumberofagent){
        res.send({status: 'danger', msg: 'You can not have more than '+ gotCountMembers +' members in your team.'});
      }
      else{
        Tempaccount.count({email : req.body.email.toLowerCase(), uniqueid : req.user.uniqueid}, function(err, gotCount){
          if(err) return console.log(err);

          if(gotCount > 0){
            res.send({status: 'danger', msg: 'This person is already invited'});
          }
          else{

            user.count({email : req.body.email.toLowerCase(), uniqueid : req.user.uniqueid}, function(err, gotCountAgent){
              if(err) return console.log(err);

              if(gotCountAgent > 0){
                res.send({status: 'danger', msg: 'This person is already member'});
              }else {
                var today = new Date();
                var uid = Math.random().toString(36).substring(7);
                var uniqueToken_id = 'k' + uid + '' + today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

                var inviteeData = new inviteagenttoken({
                  email : req.body.email,
                  token : uniqueToken_id,
                  companyId : req.user.uniqueid
                });

                inviteeData.save(function(err){
                  if(err) console.log(err);
                });

                var inviteeTempData = new Tempaccount({
                  email : req.body.email.toLowerCase(),
                  uniqueid : req.user.uniqueid
                });

                inviteeTempData.save(function(err){
                  if(err) console.log(err);
                });

                configuration.findOne({}, function(err, gotConfig) {

                  console.log(gotConfig);

                  var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

                  var email     = new sendgrid.Email({
                    to:       req.body.email,
                    from:     'support@cloudkibo.com',
                    subject:  'KiboEngage: Invitation',
                    text:     'Welcome to KiboEngage'
                  });

             
                  email.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
                    '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
                    '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
                    '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
                    '<p style="color: #ffffff">Inviting you as support agent</p> </td></tr> </table> </td> </tr> </table> ' +
                    '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
                    '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
                    '<tr> <td class="wrapper last"> <p> Hello, <br> '+ req.user.firstname +' '+ req.user.lastname +' has invited you to join '+req.user.website+' as a Support Agent.</p> <p> <ul> <li>Company Name: '+req.user.companyName+'</li> ' +
                    '<li>Company Domain: '+ req.user.website+' </li> </ul> </p> <p>To accept invitation please click the following URL to activate your account:</p> <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
                    '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> <a href="http://kiboengage.cloudapp.net/joincompany/'+ uniqueToken_id +'">http://kiboengage.cloudapp.net/joincompany/'+ uniqueToken_id + '</a> </td> <td class="expander"> </td> </tr> </table> <p> If clicking the URL above does not work, copy and paste the URL into a browser window. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
                    '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')
                  sendgrid.send(email, function(err, json) {
                    if (err) { return console.log(err); }

                    return res.send({status: 'success', msg: 'Email has been sent'});

                  });

                });
              }

            });


          }

        })

      }

    });
  });


};
