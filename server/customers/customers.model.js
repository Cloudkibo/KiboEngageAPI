'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CustomerSchema = new Schema({
  name : String,
  email : String,
  country : String,
  phone : String,
  companyid : String,
  isMobileClient : String, //possible value, 'false' for web client and 'true' for mobile client
  customerID : String // unique customer id provided by host application
});

module.exports = mongoose.model('customers', CustomerSchema);
