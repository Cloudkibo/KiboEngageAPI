'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var shortcutSchema = new Schema({

  start_time : String,
  end_time : String,
  saturday_off : Boolean,
  sunday_off : Boolean,
  companyid : String

});

module.exports = mongoose.model('shortcuts', shortcutSchema);
