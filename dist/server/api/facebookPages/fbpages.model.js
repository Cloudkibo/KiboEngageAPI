'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FacebookPagesSchema = new Schema({
  pageid : String, //This is the id of Facebook Page
  appid : String, //this is the id of facebook APP
  pageToken : String, // this is the token of page required for sending message on page
  pageTitle : String, //Page title
  pageDescription: String, //description of page
  companyid : String
  
});

module.exports = mongoose.model('fbpages', FacebookPagesSchema);
