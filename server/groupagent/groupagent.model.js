'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GroupagentSchema = new Schema({
  groupid : {type: Schema.ObjectId, ref: 'group'},
  companyid : String,
  agentid : {type: Schema.ObjectId, ref: 'Account'},
  joindate : { type: Date, default: Date.now },
  deleteStatus : { type: String, default: 'No' }
});

module.exports = mongoose.model('groupagent', GroupagentSchema);
