'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var VisitorcallsSchema = new Schema({

  username : String,  // deprecated -- use customer table instead
  useremail : String, // deprectaed -- use customer table instead

  customerid : {type: Schema.ObjectId, ref: 'customers'},
  customerID : String,//this is for mobile clients
  question : String,  // deprecated -- use messagechannel instead
  messagechannel: [String], // this is channel id
  currentPage : String,

  departmentid : {type: Schema.ObjectId, ref: 'departments'}, // this is group id
  fullurl : String,

  phone : String, // deprecated -- use customer table instead
  browser : String,

  ipAddress: String,
  country: String, // deprecated -- use customer table instead
  room : String, // deprecated -- use companyid instead
  companyid : String,
  socketid : String,

  agentname : String,  // deprecated -- use agent_ids array instead
  agentemail : String, // deprecated -- use agent_ids array instead

  agent_ids : {'type' : Array}, //{'id' : agent/groupid,'type' : agent/group}

  // status has two sets of possible values,
  // for current kibosupport: waiting, abandoned, inprogress, completed
  // for kiboengage: new, assigned, resolved, archived
  // previous use case is deprecated
  status : {type : String, default : 'waiting'},

  initiator : {type : String, default : 'visitor'},

  requesttime: Date,
  abandonedtime: Date,
  picktime: Date,
  endtime: Date,

  is_rescheduled : {type : String, default : 'false'},
  rescheduled_by: {type: Schema.ObjectId, ref: 'Account'},

  request_id : String, // this is same as session id, not changing the field name as it will break kibosupport

  callsummary: String,
  calldescription: String,
  callresolution: String,

  platform: String, // Shows if the visitor is on mobile application widget or web widget. Possible values are "web", and "mobile"
  device : String, // which mobile device it is, possible values are "android", "ios"
  device_version: String, // version of mobile device OS
  webrtc_browser: Boolean,

  deleteStatus : { type: String, default: 'No' },
 

});

module.exports = mongoose.model('visitorcalls', VisitorcallsSchema);
