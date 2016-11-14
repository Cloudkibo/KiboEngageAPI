'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var shortcutSchema = new Schema({

  shortcode : String,
  message : String,
  companyid : String

});

module.exports = mongoose.model('shortcuts', shortcutSchema);
