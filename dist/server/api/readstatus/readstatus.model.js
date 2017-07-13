'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var ReadStatusSchema = new Schema({
  company_id : String,
  request_id : String,
  message_id : String,
  agent_id : String,
  status : {type: String, default: 'unseen' },
});

module.exports = mongoose.model('readstatus', ReadStatusSchema);
