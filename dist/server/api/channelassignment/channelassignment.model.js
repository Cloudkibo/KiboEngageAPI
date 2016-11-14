'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChannelAssignmentSchema = new Schema({
  movedto: {type: Schema.ObjectId, ref: 'messagechannels'},
  movedfrom: {type: Schema.ObjectId, ref: 'messagechannels'},
  movedby: {type: Schema.ObjectId, ref: 'Account'},
  sessionid : String,
  companyid : String,
  datetime : {type: Date, default: Date.now }
});

module.exports = mongoose.model('channelassignments', ChannelAssignmentSchema);
