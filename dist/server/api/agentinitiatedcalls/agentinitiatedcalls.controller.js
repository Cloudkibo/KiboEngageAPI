'use strict';

var _ = require('lodash');
var Agentinitiatedcalls = require('./agentinitiatedcalls.model');
var deptagent = require('../deptagent/deptagent.model');
var configuration = require('../configuration/configuration.model');
var visitorcalls = require('../visitorcalls/visitorcalls.model');
var User = require('../user/user.model');

// Get list of agentinitiatedcallss
exports.index = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Agentinitiatedcalls.find({room : clientUser.uniqueid}, function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  }
  else if(req.user.isAdmin == 'Yes'){

    Agentinitiatedcalls.find({room : req.user.uniqueid}, function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })

  }
  else if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    deptagent.find({
      companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
    }).exec(function (err, gotDeptsData){

      var departmentsIdArray = new Array();

      for(var index in gotDeptsData){

        departmentsIdArray[index] = gotDeptsData[index].deptid;

      }

      Agentinitiatedcalls.find({room : req.user.uniqueid, agentemail: req.user.email},
        function (err, gotCallsData){
          if(err) { return handleError(res, err); }
          return res.json(200, gotCallsData);
        })
    })
  }

};

// Get the calls scheduled by the user
exports.myscheduledcalls = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Agentinitiatedcalls.find({agentemail : clientUser.email}, function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  } else {
    Agentinitiatedcalls.find({agentemail : req.user.email}, function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })
  }

};

// Invite someone to call
exports.invitetocall = function(req, res) {

  var newData = new Agentinitiatedcalls({
    uniqueid : req.body.uniqueid,
    agentname : req.body.agentname,
    agentemail : req.body.agentemail,
    username : req.body.username,
    useremail : req.body.useremail,
    departmentid : req.body.department,
    room: req.body.room
  });

  console.log(req.body);
  newData.save(function(err){
    if(err) console.log(err);
  });

  if(req.body.sendemail ==  'Yes'){

    // load this from database
    var sendgrid  = require('sendgrid')('cloudkibo', 'cl0udk1b0');

    var email     = new sendgrid.Email({
      to:       req.body.useremail,
      from:     'support@cloudkibo.com',
      subject:  'Invitation to join support call',
      text:     'Welcome to KiboSupport'
    });

    email.setHtml('<h1>'+ req.user.website +'</h1><br><br>'+"Hello "+req.body.username+","+'<br><br>' +req.body.inviteemail+
    '<br><br>'+"Here is the meeting URL:  "+ '<a href="'+req.body.meetingURL+'">'+req.body.meetingURL+ '</a><br><br>'+ "Regards,"+'<br>'+ req.body.agentname+'<br>'+req.user.companyName);

    email.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
      '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
      '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
      '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
      '<p style="color: #ffffff">'+req.user.website+' has invited you for call </p> </td></tr> </table> </td> </tr> </table> ' +
      '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
      '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
      '<tr> <td class="wrapper last"> <p> Hello '+ req.body.username +', <br> '+req.body.agentname+' has invited you to join conference call. </p> <p> Here is the meeting URL: </p> <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
      '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> <a href="'+req.body.meetingURL+'">'+req.body.meetingURL+ '</a> </td> <td class="expander"> </td> </tr> </table>'+
      '<p> If clicking the URL above does not work, copy and paste the URL into a browser window. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
      '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')
    sendgrid.send(email, function(err, json) {
      if (err) { return console.log(err); }

      return res.send({status: 'success', msg: 'Email has been sent'});

    });
  }

};

// Reschedule the call for the visitor
exports.reschedulecall = function(req, res) {
  var newData = new Agentinitiatedcalls({
    uniqueid : req.body.uniqueid,
    agentname : req.body.agentname,
    agentemail : req.body.agentemail,
    username : req.body.username,
    useremail : req.body.useremail,
    question : req.body.question,
    currentPage : req.body.currentPage,
    departmentid: req.body.departmentid,
    fullurl : req.body.fullurl,
    phone : req.body.phone,
    browser : req.body.browser,
    ipAddress: req.body.ipAddress,
    country: req.body.country,
    room: req.body.room,
    requesttime: req.body.requesttime,
    request_id: req.body.request_id
  });

  newData.save(function(err){
    if(err) console.log(err);
  });

  if(req.body.sendemail ==  'Yes'){

    configuration.findOne({}, function(err, gotConfig) {

      var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

      var email     = new sendgrid.Email({
        to:       req.body.useremail,
        from:     'support@cloudkibo.com',
        subject:  'Invitation to join support call',
        text:     'Welcome to KiboSupport'
      });

       email.setHtml('<h1>'+ req.user.website +'</h1><br><br>'+"Hello "+req.body.username+","+'<br><br>' +req.body.scheduleemail+
        '<br><br>'+"Here is the meeting URL:  "+ '<a href="'+req.body.meetingURL+'">'+req.body.meetingScheduleURL+ '</a><br><br>'+ "Regards,"+'<br><br>'+ req.body.agentname+'<br>'+req.user.companyName);

      email.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
        '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
        '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
        '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
        '<p style="color: #ffffff">'+req.user.companyName+' has invited you for meeting </p> </td></tr> </table> </td> </tr> </table> ' +
        '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
        '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
        '<tr> <td class="wrapper last"> <p> Hello, '+ req.body.username +' <br> '+req.body.agentname+', support Agent has invited you to join meeting. </p> <p> Here is the meeting URL: </p> <!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
        '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> <a href="'+req.body.meetingURL+'">'+req.body.meetingScheduleURL+ '</a> </td> <td class="expander"> </td> </tr> </table>'+
        '<p> If clicking the URL above does not work, copy and paste the URL into a browser window. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table> <!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This ia a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
        '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')

      sendgrid.send(email, function(err, json) {
        if (err) { return console.log(err); }

        return res.send({status: 'success', msg: 'Email has been sent'});

      });

    });

  }
};

// Get a single agentinitiatedcalls
exports.show = function(req, res) {
  Agentinitiatedcalls.findById(req.params.id, function (err, agentinitiatedcalls) {
    if(err) { return handleError(res, err); }
    if(!agentinitiatedcalls) { return res.send(404); }
    return res.json(agentinitiatedcalls);
  });
};

// Creates a new agentinitiatedcalls in the DB.
exports.create = function(req, res) {
  Agentinitiatedcalls.create(req.body, function(err, agentinitiatedcalls) {
    if(err) { return handleError(res, err); }
    return res.json(201, agentinitiatedcalls);
  });
};

// Updates an existing agentinitiatedcalls in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Agentinitiatedcalls.findById(req.params.id, function (err, agentinitiatedcalls) {
    if (err) { return handleError(res, err); }
    if(!agentinitiatedcalls) { return res.send(404); }
    var updated = _.merge(agentinitiatedcalls, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, agentinitiatedcalls);
    });
  });
};

// Deletes a agentinitiatedcalls from the DB.
exports.destroy = function(req, res) {
  Agentinitiatedcalls.findById(req.params.id, function (err, agentinitiatedcalls) {
    if(err) { return handleError(res, err); }
    if(!agentinitiatedcalls) { return res.send(404); }
    agentinitiatedcalls.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
