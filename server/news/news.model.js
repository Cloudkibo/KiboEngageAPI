'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NewsSchema = new Schema({
  dateCreated : {type: Date, default: Date.now },
  message : String,
  createdBy :  {type: Schema.ObjectId, ref: 'Account'},
  unread : String,//String (possible values 'true' or 'false')
  companyid : String,
  target :  {type: Schema.ObjectId, ref: 'Account'},//agent id for whom the news is intended
  url : String, // (url of the page to redirect agent when news is clicked)
  
});

module.exports = mongoose.model('news', NewsSchema);
