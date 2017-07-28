'use strict';

var _ = require('lodash');
var MessageChannel = require('./messagechannels.model');
var User = require('../user/user.model');
var deptagent = require('../deptagent/deptagent.model');
var Sessions = require('../visitorcalls/visitorcalls.model');

// Get list of MessageChannels
exports.index = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      MessageChannel.find({companyid : clientUser.uniqueid,deleteStatus : 'No'}, function (err, gotmessagechannel){
        if(err) { return handleError(res, err); }
        return res.json(200, gotmessagechannel);
      })
    })
  }
  else{
    console.log('inside is admin')
    console.log(req.user)
    MessageChannel.find({companyid : req.user.uniqueid,deleteStatus : 'No'}, function (err, gotmessagechannel){
      console.log(gotmessagechannel)
      if(err) { return handleError(res, err); }
      return res.json(200, gotmessagechannel);
    })

  }

};

// Get a single MessageChannel
exports.show = function(req, res) {
  MessageChannel.findById(req.params.id, function (err, messagechannel) {
    if(err) { return handleError(res, err); }
    if(!messagechannel) { return res.send(404); }
    return res.json(messagechannel);
  });
};

// Creates a new MessageChannel in the DB.
exports.create = function(req, res) {
  MessageChannel.create(req.body, function(err, messagechannel) {
    if(err) { return handleError(res, err); }
    return res.json(201, messagechannel);
  });
};

// Updates an existing MessageChannel in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  MessageChannel.findById(req.params.id, function (err, messagechannel) {
    if (err) { return handleError(res, err); }
    if(!messagechannel) { return res.send(404); }
    var updated = _.merge(messagechannel, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, messagechannel);
    });
  });
};

// Deletes a MessageChannel from the DB.
exports.destroy = function(req, res) {
  MessageChannel.findById(req.params.id, function (err, messagechannel) {
    if(err) { return handleError(res, err); }
    if(!messagechannel) { return res.send(404); }
          var today = new Date();
          var deptDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

          messagechannel.deleteStatus = 'Yes';
          messagechannel.msg_channel_name = 'deleted '+deptDeleteDate +' '+messagechannel.msg_channel_name;

          messagechannel.save(function(err){
            if(err) return console.log(err);
            Sessions.update({messagechannel : {"$in" : [messagechannel._id]}, companyid : req.user.uniqueid},
                                        {deleteStatus : 'Yes'}, {multi : true}, function(err){
                                                  if(err) return console.log(err);
                                                  res.send(204);
          })

            })


  });
};

exports.deletesubgroups = function(req, res) {
  req.body.ids.forEach(function(itemId){
    res.send(204);
    MessageChannel.findById(itemId, function (err, messagechannel) {
      if(err) { return handleError(res, err); }
      if(!messagechannel) { return res.send(404); }
            var today = new Date();
            var deptDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

            messagechannel.deleteStatus = 'Yes';
            messagechannel.msg_channel_name = 'deleted '+deptDeleteDate +' '+messagechannel.msg_channel_name;

            messagechannel.save(function(err){
              if(err) return console.log(err);
              Sessions.update({messagechannel : {"$in" : [messagechannel._id]}, companyid : req.user.uniqueid},
                                          {deleteStatus : 'Yes'}, {multi : true}, function(err){
                                                    if(err) return console.log(err);

            })

              })


    });

  })

};

function handleError(res, err) {
  return res.send(500, err);
}
