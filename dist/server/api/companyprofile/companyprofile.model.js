'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CompanyprofileSchema = new Schema({

  companyid : String,

  allowChat : { type: String, default: 'No' },  // deprecated
  isdomainemail: { type: String, default: 'No' },

  allowCompletingOfCalls : { type: String, default: 'No' },
  completeCallTime : { type: Number, default: 30 },

  allowsmsnotification : { type: String, default: 'No' },
  allowemailnotification : { type: String, default: 'No' },

  smsphonenumber : { type: Number, default: 30 },
  notificationemailaddress : String,

  abandonedscheduleemail1 : String,
  abandonedscheduleemail2 : String,
  abandonedscheduleemail3 : String,

  completedscheduleemail1 : String,
  completedscheduleemail2 : String,
  completedscheduleemail3 : String,

  invitedscheduleemail1 : String,
  invitedscheduleemail2 : String,
  invitedscheduleemail3 : String,
  enableFacebook : {type:Boolean,default:true}, //extra field to enable/disable facebook integration

  maxnumberofdepartment : { type: Number, default: 20},
  maxnumberofchannels : { type: Number, default: 5} , //per group

  showsummary : { type: String, default: 'No'},

  widgetwindowtab: { type: String, default: 'window'} // other value is 'tab'

});

module.exports = mongoose.model('companyprofile', CompanyprofileSchema);
