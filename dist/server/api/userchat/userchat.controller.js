'use strict';

var _ = require('lodash');
var Userchat = require('./userchat.model');
var fbmessages = require('../fbmessages/fbmessages.model');

var logger = require('../../components/logger/logger');

// Get list of userchats

exports.index = function(req, res) {
  Userchat.find({companyid: req.user.uniqueid}, function (err, userchats) {
    if(err) { return handleError(res, err); }
    return res.json(200, userchats);
  });
};

exports.sync = function(req, res) {
  Userchat.find({companyid: req.body.companyid, $or: [{ to : req.body.customerid}, {from : req.body.customerid } ]}, function (err, userchats) {
    if(err) { return handleError(res, err); }
    return res.json(200, userchats);
  });
};

exports.visitoremail = function(req, res) {
  Userchat.find({companyid: req.body.companyid, visitoremail: req.body.visitoremail}, function (err, userchats) {
    if(err) { return handleError(res, err); }
    return res.json(200, userchats);
  });
};


// incremental chat sync with message status 'sent'
exports.partialChatSync = function(req, res) {
  console.log('partial sync is called ');
  console.log(req.body);
  Userchat.find({companyid: req.body.companyid,to : req.body.customerid,status : 'sent'}, function (err, userchats) {
    if(err) { return handleError(res, err); }
    return res.json(200, userchats);
  });
};

// fetch chatmessage using uniqueid
exports.fetchChat = function(req, res) {
  console.log('fetch chat')
  console.log(req.body)
  Userchat.find({uniqueid: req.body.uniqueid,request_id: req.body.request_id}, function (err, userchats) {
    if(err) { return handleError(res, err); }
    return res.json(200, userchats);
  });
};

// Get a single userchat
exports.show = function(req, res) {
  Userchat.findById(req.params.id, function (err, userchat) {
    if(err) { return handleError(res, err); }
    if(!userchat) { return res.send(404); }
    return res.json(userchat);
  });
};


// Creates a new userchat in the DB.
exports.create = function(req, res) {
  console.log(req.body)
  req.body.status = 'sent';
  Userchat.create(req.body, function(err, userchat) {
    if(err) { return handleError(res, err); }
    return res.json(201, userchat);
  });
};

// Get Specific chat session by using request id
exports.getSpecificChat = function(req, res) {
  Userchat.find({request_id: req.body.request_id, companyid: req.body.companyid}, function (err, userchats) {
    if(err) { return handleError(res, err); }
    return res.json(200, userchats);
  });
};

// Updates an existing userchat in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Userchat.findById(req.params.id, function (err, userchat) {
    if (err) { return handleError(res, err); }
    if(!userchat) { return res.send(404); }
    var updated = _.merge(userchat, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, userchat);
    });
  });
};


// Updates an existing userchat in the DB.
exports.updateStatus = function(req, res) {
  console.log('update status api is called');
  console.log(req.body);
  if(req.body.messages)
  {
   for(var i=0;i<req.body.messages.length;i++)
      {
               var obj = req.body.messages[i]
               console.log(obj.uniqueid);
               Userchat.update({'uniqueid':obj.uniqueid,'request_id' : obj.request_id},{$set:{'status':obj.status}},
                function(err, result) {
                if(err){
                  res.send(404);
                }
        });

      }
    res.send({status : 'statusUpdated'});
  }
  else{
    res.send({status : 'statusUpdateFailed,data not in correct format'});
  }

};

// Deletes a userchat from the DB.
exports.destroy = function(req, res) {
  Userchat.findById(req.params.id, function (err, userchat) {
    if(err) { return handleError(res, err); }
    if(!userchat) { return res.send(404); }
    userchat.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}

// new endpoint for handling all the types of chat coming back from Cloudkibo
// Creates a new userchat in the DB.
exports.createforCloudkibo = function(req, res) {
  logger.serverLog('info', 'Inside Cloudkibo endpoint, req body = '+ JSON.stringify(req.body));
  var allparams = req.body.allparams;
  if(allparams.conf_type === 'facebook'){
          var today = new Date();
          var uid = Math.random().toString(36).substring(7);
          var unique_id = 'h' + uid + '' + today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

          var userid = req.body.request_id.split('$')[0]
          var pageid = req.body.request_id.split('$')[1]
          var messagebody= {
                          mid: unique_id,
                          seq: 1,
                          text: req.body.msg,
                        };

          var saveMsg = {
                        senderid: allparams.role == 'agent'?allparams.agentemail:allparams.visitoremail,
                        recipientid: allparams.role == 'agent'?allparams.visitoremail:allparams.agentemail,
                        companyid: req.body.companyid,
                        timestamp: Date.now(),
                        message: messagebody,

                        pageid: pageid,
                  
                      }
        fbmessages.create(saveMsg, function(err, message) {
              if(err) { return handleError(res, err); }
              return res.json(201, message);
            });

  }
  else{
    Userchat.create(req.body, function(err, userchat) {
    if(err) { return handleError(res, err); }
    return res.json(201, userchat);
  });

  }
};
