'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AgentAssignmentSchema = new Schema({
  assignedto: {type: Schema.ObjectId, ref: 'Account'},
  assignedby: {type: Schema.ObjectId, ref: 'Account'},
  sessionid : String,
  companyid : String,
  datetime : {type: Date, default: Date.now }
});

module.exports = mongoose.model('agentassignments', AgentAssignmentSchema);
