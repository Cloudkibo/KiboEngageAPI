'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AgentinitiatedcallsSchema = new Schema({

  uniqueid: String,

  agentname: String,
  agentemail : String,

  departmentid : {type: Schema.ObjectId, ref: 'departments'},

  username : String,
  useremail : String,

  question : String,
  currentPage : String,
  fullurl : String,

  phone : String,
  browser : String,

  ipAddress: String,
  country: String,

  room : String, // Check it for all the conditions
  date : { type: Date, default: Date.now },

  request_id : String

});

module.exports = mongoose.model('agentinitiatedcalls', AgentinitiatedcallsSchema);
