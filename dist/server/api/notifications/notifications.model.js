'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NotificationsSchema = new Schema({
  title: String,
  description: String,
  agent_id: {type: Schema.ObjectId, ref: 'Account'},
  hasImage : {type : String, default : 'false'},
  image_url : String,
  companyid : String,
  datetime : {type: Date, default: Date.now },
  uniqueid : String,

});

module.exports = mongoose.model('notifications', NotificationsSchema);
