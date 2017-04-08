'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FacebookCustomerSchema = new Schema({
  first_name : String,
  last_name : String,
  user_id:String, //this is the facebook id of a customer
  email : String,
  timestamp : String,
  timezone : Number,
  companyid : String,
  gender : String, 
  profile_pic: String,  
  
});

module.exports = mongoose.model('fbcustomers', FacebookCustomerSchema);
