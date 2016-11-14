'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var msgChannelSchema = new Schema({

  msg_channel_name : String,
  msg_channel_description : String,
  companyid : String,
  groupid : String,
  createdby : {type: Schema.ObjectId, ref: 'Account'},
  creationdate : { type: Date, default: Date.now },
  activeStatus : { type: String, default: 'Yes' },
  deleteStatus : { type: String, default: 'No' },
 

});

module.exports = mongoose.model('messagechannels', msgChannelSchema);
