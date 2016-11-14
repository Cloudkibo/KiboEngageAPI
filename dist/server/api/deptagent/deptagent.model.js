'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeptagentSchema = new Schema({
  deptid : {type: Schema.ObjectId, ref: 'department'},
  companyid : String,
  agentid : {type: Schema.ObjectId, ref: 'Account'},
  joindate : { type: Date, default: Date.now },
  deleteStatus : { type: String, default: 'No' }
});

module.exports = mongoose.model('deptagent', DeptagentSchema);
