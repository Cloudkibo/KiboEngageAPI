'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var InviteagenttokenSchema = new Schema({
  email : String,
  token : {type: String, required: true},
  companyId : String,
  createdAt : {type: Date, required: true, default: Date.now, expires: '120h'}
});

module.exports = mongoose.model('inviteagenttoken', InviteagenttokenSchema);
