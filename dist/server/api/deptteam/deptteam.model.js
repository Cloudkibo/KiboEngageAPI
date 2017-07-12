'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeptteamSchema = new Schema({
  deptid : {type: Schema.ObjectId, ref: 'department'},
  companyid : String,
  teamid : {type: Schema.ObjectId, ref: 'group'},
  joindate : { type: Date, default: Date.now },
  deleteStatus : { type: String, default: 'No' }
});

module.exports = mongoose.model('deptteam', DeptteamSchema);
