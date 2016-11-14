'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IpcountrySchema = new Schema({
  startip : String,
  endip : String,
  startipint : Number,
  endipint : Number,
  ccode : String,
  country : String
});

module.exports = mongoose.model('ipcountry', IpcountrySchema);
