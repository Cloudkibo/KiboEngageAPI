'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FbPageteamSchema = new Schema({
  pageid : {type: Schema.ObjectId, ref: 'fbpages'},
  companyid : String,
  teamid : {type: Schema.ObjectId, ref: 'group'},
  joindate : { type: Date, default: Date.now },
  deleteStatus : { type: String, default: 'No' }
});

module.exports = mongoose.model('fbpageteam', FbPageteamSchema);
