'use strict';

var _ = require('lodash');
var facebooksessions = require('./facebooksessions.model');
var department = require('../department/department.model');
var deptagent = require('../deptagent/deptagent.model');
var fbcustomers = require('../facebookCustomers/fbcustomers.model');
var fbagentassignments = require('../fbagentassignment/fbagentassignment.model');
var User = require('../user/user.model');
var logger = require('../../components/logger/logger');


// get list of fb sessions
exports.index = function(req, res) {

  facebooksessions.find({companyid : req.user.uniqueid,deleteStatus : 'No'}).populate('user_id pageid').exec(function (err, gotData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotData);
    })

};


exports.createsession = function(req, res) {

  console.log('fbcreatesession is called');
  logger.serverLog('info', 'This is body in fbcreatesession '+ JSON.stringify(req.body) );
  
  fbcustomers.findOne({user_id: req.body.user_id,companyid : req.user.uniqueid}, function(err, gotCustomer){
    if (err) return res.json(501, {status: 'database error at find customer'})

    
    if(gotCustomer) {
      
      //check if session already exists(this change is for keeping session persistent if chat is on same page by same customer)
      
      facebooksessions.findOne({pageid: req.body.pageid,user_id:gotCustomer._id}, function(err, gotSession){
              if (err) return res.json(501, {status: 'database error at visitor calls'})
              if(!gotSession){
                      var newData = new facebooksessions({
                      user_id : gotCustomer._id,
                      pageid: req.body.pageid,
                      requesttime : req.body.requesttime,
                      companyid: req.body.companyid,
                      status: 'new',
                      agent_ids: [],
                    });

                    newData.save(function(err,obj){
                      if(err) console.log(err);
                      res.json(200, {status : 'success','fbsession':obj});
                    });
              }

              else{
                res.json(200, {status : 'success','fbsession':gotSession}); //customer and session both are already created
              }
      })
    } else {
      var newfbcustomers = new fbcustomers({
      first_name : req.body.first_name,
		  last_name : req.body.last_name,
		  user_id:req.body.user_id, //this is the facebook id of a customer
		  email : req.body.email,
		  timestamp : req.body.timestamp,
		  timezone : req.body.timezone,
		  companyid : req.body.companyid,
		  gender : req.body.gender, 
		  profile_pic: req.body.profile_pic,  
      });

      newfbcustomers.save(function(err, customer){
        if(err) return res.json(501, {status: 'database error at new customer'})

        if(!customer) return res.json(501, {status: 'database error at find new customer'})

        var newData = new facebooksessions({
          			     user_id : customer._id,
                      pageid: req.body.pageid,
                      requesttime : req.body.requesttime,
                      companyid: req.body.companyid,
                      status: 'new',
                      agent_ids: [],
        });

        newData.save(function(err,obj){
          if(err) console.log(err);
          res.json(200, {status : 'success','fbsession':obj});
        });
      })
    }

  })

};



exports.assignToAgent = function(req, res) {
   facebooksessions.findOne({pageid: req.body.pageid,user_id:req.body.user_id}, function(err, gotData){

    gotData.agent_ids.push({'id' : req.body.agentAssignment.assignedto,'type' : req.body.type});
    gotData.status = 'assigned';
    gotData.picktime = Date.now();

    console.log(gotData.agent_ids)    
    gotData.save(function(err){
      if(err) console.log(err);

      var newData = new fbagentassignments(req.body.agentAssignment);

      newData.save(function(err){
        if(err) return res.json(501, {status: 'database error on agent assignment table entry'});

        res.json(200, {status : 'success'});
      })

    });
  })
};




exports.resolveSession = function(req, res) {
  facebooksessions.findOne({pageid: req.body.pageid,user_id:req.body.user_id}, function(err, gotData){

    gotData.status = 'resolved';
    gotData.endtime = Date.now();

    gotData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};


exports.updateSession = function(req, res) {
  facebooksessions.findOne({pageid: req.body.pageid,user_id:req.body.user_id}, function(err, gotData){

    gotData.status = req.body.status;
    gotData.endtime = Date.now();

    gotData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};


