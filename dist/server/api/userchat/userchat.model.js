'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserchatSchema = new Schema({
  // _id is our messageId
  to : String,
  from : String,
  customername : String,
  visitoremail : String,
  agentemail : [String],
  uniqueid:String,

  //agentid: [{type: Schema.ObjectId, ref: 'Account'}],
  agentid: [String],



  type: String, // two possible values, 'log' or 'message'
  status : String, //4 possible values 'pending', 'sent', 'delivered' ,'seen'
  msg : String,

  datetime : {type: Date, default: Date.now },
  request_id : String,                        // this is session id, not changing the field name as it will break kibosupport
  messagechannel: {type: Schema.ObjectId, ref: 'messagechannels'},  // this is channel id

  companyid: String,

  is_seen: String // two possible values 'yes' or 'no'

});

module.exports = mongoose.model('userchat', UserchatSchema);
