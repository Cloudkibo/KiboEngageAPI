'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DepartmentSchema = new Schema({
  deptname : String,
  deptdescription: String,
  companyid : String,
  createdby : {type: Schema.ObjectId, ref: 'Account'},
  creationdate : { type: Date, default: Date.now },
  deleteStatus : { type: String, default: 'No' },
  deptCapital : String
});

module.exports = mongoose.model('department', DepartmentSchema);
