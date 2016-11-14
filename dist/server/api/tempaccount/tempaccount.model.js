'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TempaccountSchema = new Schema({

  email : { type : String , lowercase : true},
  date  :  { type: Date, default: Date.now },
  uniqueid : String

});

module.exports = mongoose.model('tempaccount', TempaccountSchema);
