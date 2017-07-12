'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
//Team
var GroupSchema = new Schema({
  groupname : String,
  groupdescription: String,
  companyid : String,
  createdby : {type: Schema.ObjectId, ref: 'Account'},
  creationdate : { type: Date, default: Date.now },
  deleteStatus : { type: String, default: 'No' },
  status : String //possible values : 'public' or 'private'
});

module.exports = mongoose.model('group', GroupSchema);
