'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ConfigurationSchema = new Schema({

  abandonedscheduleemail1 : String,
  abandonedscheduleemail2 : String,
  abandonedscheduleemail3 : String,

  completedscheduleemail1 : String,
  completedscheduleemail2 : String,
  completedscheduleemail3 : String,

  invitedscheduleemail1 : String,
  invitedscheduleemail2 : String,
  invitedscheduleemail3 : String,

  maxnumberofdepartment : Number,
  maxnumberofagent : Number,

  sendgridusername : String,
  sendgridpassword : String,

  allowCompletingOfCalls : { type: String, default: 'No' },
  completeCallTime : { type: Number, default: 30 },

  allowChat : { type: String, default: 'No' },
  isdomainemail: { type: String, default: 'No' },

  showsummary : { type: String, default: 'No' },
  selectLogo : { type: String, default: 'Logo 1' },

  sitedomain : {type: String},
  cloudkibodomain : {type: String}

});

module.exports = mongoose.model('configuration', ConfigurationSchema);
