'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var file = new Schema({
      to : String,
      from : String,
      date : {type: Date, default: Date.now },
      uniqueid: String,
      file_name : String,
      file_size : Number,
      path : String,
      file_type : String,
      status : String, //4 possible values 'pending', 'sent', 'delivered' ,'seen'
  	  request_id : String, //session in which file is done
});



module.exports = mongoose.model('filetransfer', file);
