'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FacebookSessionSchema = new Schema({

 
  user_id : {type: Schema.ObjectId, ref: 'fbcustomers'},
  pageid : {type: Schema.ObjectId, ref: 'fbpages'}, // this is page id
  companyid : String,
  agent_ids : {'type' : Array}, //{'id' : agent/groupid,'type' : agent/group}

  // status has two sets of possible values,
  // for kiboengage: new, assigned, resolved, archived
  status : {type : String, default : 'new'},
  requesttime: Date,
  picktime: Date,
  endtime: Date,
  deleteStatus : { type: String, default: 'No' },
 

});

module.exports = mongoose.model('facebooksessions', FacebookSessionSchema);
