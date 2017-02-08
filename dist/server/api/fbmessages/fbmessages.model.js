'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FacebookMessagesSchema = new Schema({
  senderid : String, // this is the user_id or page_id
  recipientid : String,
  timestamp : String,
  message: Object,
  companyid : String,
 
  
});

module.exports = mongoose.model('fbmessages', FacebookMessagesSchema);
