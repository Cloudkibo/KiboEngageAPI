'use strict';

var _ = require('lodash');
var Visitorcalls = require('./visitorcalls.model');
var department = require('../department/department.model');
var deptagent = require('../deptagent/deptagent.model');
var customers = require('../customers/customers.model');
var channelassignments = require('../channelassignment/channelassignment.model');
var agentassignments = require('../agentassignment/agentassignment.model');
var User = require('../user/user.model');
var VisitorcallsSocket = require('./visitorcalls.socket');
var logger = require('../../components/logger/logger');
var customers = require('../customers/customers.model');

// Get list of visitorcallss
exports.index = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.find({room : clientUser.uniqueid} , function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  }
  else{
    Visitorcalls.find({room : req.user.uniqueid}, function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })

  }

};

exports.index2 = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.find({companyid : clientUser.uniqueid,deleteStatus : 'No'}).populate('customerid').exec(function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  }
  else{
    Visitorcalls.find({companyid : req.user.uniqueid,deleteStatus : 'No'}).populate('customerid').exec(function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })

  }

};


exports.mobilesessions = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.find({companyid : clientUser.uniqueid,deleteStatus : 'No',platform:'mobile'}).populate('customerid').exec(function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  }
  else{
    Visitorcalls.find({companyid : req.user.uniqueid,deleteStatus : 'No',platform:'mobile'}).populate('customerid').exec(function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })

  }

};


// Get Waiting Calls data
exports.waitingcalls = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.find({status : 'waiting', room : clientUser.uniqueid} , function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  }
  else if(req.user.isAdmin == 'Yes'){

    Visitorcalls.find({status : 'waiting', room : req.user.uniqueid} , function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })

  }
  else if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    department.count({companyid: req.user.uniqueid}, function(err, gotDeptCount){
      if(err) { return handleError(res, err); }

      if(gotDeptCount>0){

        deptagent.find({
          companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
        }).exec(function (err, gotDeptsData){

          var departmentsIdArray = new Array();
          for(var index in gotDeptsData){
            departmentsIdArray[index] = gotDeptsData[index].deptid;
          }

          Visitorcalls.find({status : 'waiting', room : req.user.uniqueid, departmentid : {$in : departmentsIdArray}},
            function (err, gotCallsData){
              if(err) { return handleError(res, err); }
              return res.json(200, gotCallsData);
            })
        })
      }
      else{

        Visitorcalls.find({status : 'waiting', room : req.user.uniqueid},
          function (err, gotCallsData){
            if(err) { return handleError(res, err); }
            return res.json(200, gotCallsData);
          })
      }
    })
  }

};

// Get Abandoned Calls data
exports.abandonedcalls = function(req, res){

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.find({status : 'abandoned', room : clientUser.uniqueid} , function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  }
  else if(req.user.isAdmin == 'Yes'){

    Visitorcalls.find({status : 'abandoned', room : req.user.uniqueid} , function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })

  }
  else if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    department.count({companyid: req.user.uniqueid}, function(err, gotDeptCount){
      if(err) { return handleError(res, err); }

      if(gotDeptCount>0){

        deptagent.find({
          companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
        }).exec(function (err, gotDeptsData){

          var departmentsIdArray = new Array();
          for(var index in gotDeptsData){
            departmentsIdArray[index] = gotDeptsData[index].deptid;
          }

          Visitorcalls.find({status : 'abandoned', room : req.user.uniqueid, departmentid : {$in : departmentsIdArray}},
            function (err, gotCallsData){
              if(err) { return handleError(res, err); }
              return res.json(200, gotCallsData);
            })
        })
      }
      else{

        Visitorcalls.find({status : 'abandoned', room : req.user.uniqueid},
          function (err, gotCallsData){
            if(err) { return handleError(res, err); }
            return res.json(200, gotCallsData);
          })
      }
    })
  }

};

// Get Progress Calls data
exports.progresscalls = function(req, res){

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.find({status : 'progress', room : clientUser.uniqueid} , function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  }
  else if(req.user.isAdmin == 'Yes'){

    Visitorcalls.find({status : 'progress', room : req.user.uniqueid} , function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })

  }
  else if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    department.count({companyid: req.user.uniqueid}, function(err, gotDeptCount){
      if(err) { return handleError(res, err); }

      if(gotDeptCount>0){

        deptagent.find({
          companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
        }).exec(function (err, gotDeptsData){

          var departmentsIdArray = new Array();
          for(var index in gotDeptsData){
            departmentsIdArray[index] = gotDeptsData[index].deptid;
          }

          Visitorcalls.find({status : 'progress', room : req.user.uniqueid, departmentid : {$in : departmentsIdArray}},
            function (err, gotCallsData){
              if(err) { return handleError(res, err); }
              return res.json(200, gotCallsData);
            })
        })
      }
      else{

        Visitorcalls.find({status : 'progress', room : req.user.uniqueid},
          function (err, gotCallsData){
            if(err) { return handleError(res, err); }
            return res.json(200, gotCallsData);
          })
      }
    })
  }

};

// Get Completed Calls data
exports.completedcalls = function(req, res){

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.find({status : 'completed', room : clientUser.uniqueid} , function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  }
  else if(req.user.isAdmin == 'Yes'){

    Visitorcalls.find({status : 'completed', room : req.user.uniqueid} , function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })

  }
  else if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    department.count({companyid: req.user.uniqueid}, function(err, gotDeptCount){
      if(err) { return handleError(res, err); }

      if(gotDeptCount>0){

        deptagent.find({
          companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
        }).exec(function (err, gotDeptsData){

          var departmentsIdArray = new Array();
          for(var index in gotDeptsData){
            departmentsIdArray[index] = gotDeptsData[index].deptid;
          }

          Visitorcalls.find({status : 'completed', room : req.user.uniqueid, departmentid : {$in : departmentsIdArray}},
            function (err, gotCallsData){
              if(err) { return handleError(res, err); }
              return res.json(200, gotCallsData);
            })
        })
      }
      else{

        Visitorcalls.find({status : 'completed', room : req.user.uniqueid},
          function (err, gotCallsData){
            if(err) { return handleError(res, err); }
            return res.json(200, gotCallsData);
          })
      }
    })
  }

};

// Get Consolidated Calls data
exports.consolidatedcalls = function(req, res){

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.find({$or : [{status : 'waiting'}, {status : 'progress'}], room : clientUser.uniqueid} , function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  }
  else if(req.user.isAdmin == 'Yes'){

    Visitorcalls.find({$or : [{status : 'waiting'}, {status : 'progress'}], room : req.user.uniqueid} , function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })

  }
  else if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    department.count({companyid: req.user.uniqueid}, function(err, gotDeptCount){
      if(err) { return handleError(res, err); }

      if(gotDeptCount>0){

        deptagent.find({
          companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
        }).exec(function (err, gotDeptsData){

          var departmentsIdArray = new Array();
          for(var index in gotDeptsData){
            departmentsIdArray[index] = gotDeptsData[index].deptid;
          }

          Visitorcalls.find({$or : [{status : 'waiting'}, {status : 'progress'}], room : req.user.uniqueid, departmentid : {$in : departmentsIdArray}},
            function (err, gotCallsData){
              if(err) { return handleError(res, err); }
              return res.json(200, gotCallsData);
            })
        })
      }
      else{

        Visitorcalls.find({$or : [{status : 'waiting'}, {status : 'progress'}], room : req.user.uniqueid},
          function (err, gotCallsData){
            if(err) { return handleError(res, err); }
            return res.json(200, gotCallsData);
          })
      }
    })
  }

};

// Get Statistics of calls done from website pages
exports.pagestats = function(req, res){
  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.aggregate({
          $match :
          {
            room : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { currentpage : "$currentPage", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
            count: { $sum: 1 }
          }
        }, function (err, gotCallsData){
          if(err) { return handleError(res, err); }
          return res.json(200, gotCallsData);
        })
    })
  }
  else {
    Visitorcalls.aggregate({
        $match :
        {
          room : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { currentpage : "$currentPage", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
          count: { $sum: 1 }
        }
      }, function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
  }

};

exports.pagestats2 = function(req, res){
  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.aggregate({
          $match :
          {
            companyid : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { currentpage : "$currentPage", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
            count: { $sum: 1 }
          }
        }, function (err, gotCallsData){
          if(err) { return handleError(res, err); }
          return res.json(200, gotCallsData);
        })
    })
  }
  else {
    Visitorcalls.aggregate({
        $match :
        {
          companyid : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { currentpage : "$currentPage", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
          count: { $sum: 1 }
        }
      }, function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
  }

};

exports.statsbyplatform = function(req, res){
  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.aggregate({
          $match :
          {
            companyid : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { platform : "$platform", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
            count: { $sum: 1 }
          }
        }, function (err, gotCallsData){
          if(err) { return handleError(res, err); }
          return res.json(200, gotCallsData);
        })
    })
  }
  else {
    Visitorcalls.aggregate({
        $match :
        {
          companyid : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { platform : "$platform", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
          count: { $sum: 1 }
        }
      }, function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
  }

};

exports.statsbydevice = function(req, res){
  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.aggregate({
          $match :
          {
            companyid : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { device : "$device", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
            count: { $sum: 1 }
          }
        }, function (err, gotCallsData){
          if(err) { return handleError(res, err); }
          return res.json(200, gotCallsData);
        })
    })
  }
  else {
    Visitorcalls.aggregate({
        $match :
        {
          companyid : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { device : "$device", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
          count: { $sum: 1 }
        }
      }, function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
  }

};

exports.statsbymessagechannel = function(req, res){
  console.log( req.body.departmentid);

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
       department.findById(req.body.departmentid).exec(function (err, deptt){
        if(err) { return handleError(res, err); }
        if(!deptt) { return res.send(404); }
        console.log(deptt);

      Visitorcalls.aggregate({
          $match :
          {
            companyid : clientUser.uniqueid,
            departmentid : deptt._id
          }
        },
        { $unwind: "$messagechannel" },
        {
          $group : {
            _id : { messagechannel : "$messagechannel", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
            count: { $sum: 1 }
          }
        }, function (err, gotCallsData){
          if(err) { return handleError(res, err); }
          return res.json(200, gotCallsData);
        })
       })

    })
  }
  else {
    department.findById(req.body.departmentid).exec(function (err, deptt){
        if(err) { return handleError(res, err); }
        if(!deptt) { return res.send(404); }
        console.log(deptt);
    Visitorcalls.aggregate({
        $match :
        {
          companyid : req.user.uniqueid,
          departmentid : deptt._id
        }
      },
      { $unwind: "$messagechannel" },
      {
        $group : {
          _id : { messagechannel : "$messagechannel", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
          count: { $sum: 1 }
        }
      }, function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        console.log(gotCallsData);
        return res.json(200, gotCallsData);
      })
    })
  }

};

exports.statsbyagents = function(req, res){
  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.aggregate({
          $match :
          {
            companyid : clientUser.uniqueid
          }
        },
        { $unwind: "$agent_ids" },
        {
          $group : {
            _id : { agent_ids : "$agent_ids", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
            count: { $sum: 1 }
          }
        }, function (err, gotCallsData){
          if(err) { return handleError(res, err); }
          return res.json(200, gotCallsData);
        })
    })
  }
  else {
    Visitorcalls.aggregate({
        $match :
        {
          companyid : req.user.uniqueid
        }
      },
      { $unwind: "$agent_ids" },
      {
        $group : {
          _id : { agent_ids : "$agent_ids", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
          count: { $sum: 1 }
        }
      }, function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
  }

};

exports.topcustomers = function(req, res){
  if(req.user.isOwner == 'Yes') {
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.aggregate({
          $match :
          {
            companyid : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { customerid : "$customerid", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
            count: { $sum: 1 }
          }
        }, function (err, gotData){
          if(err) { return handleError(res, err); }
          customers.find({companyid : clientUser.uniqueid}, function(err3, gotCustomers){
            return res.json(200, {topCustomersCount : gotData, customersData : gotCustomers});
          })
        })
    })
  } else {
    Visitorcalls.aggregate({
        $match :
        {
          companyid : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { customerid : "$customerid", month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }},
          count: { $sum: 1 }
        }
      }, function (err, gotData){
        if(err) { return handleError(res, err); }
        customers.find({companyid : req.user.uniqueid}, function(err3, gotCustomers){
          return res.json(200, {topCustomersCount : gotData, customersData : gotCustomers});
        })
      })
  }
};

// Get statistics of calls done by agents
exports.agentcallstats = function(req, res){
  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.aggregate({
          $match :
          {
            room : clientUser.uniqueid,
            status : "completed"
          }
        },
        {
          $group : {
            _id : { month: { $month: "$endtime" }, day: { $dayOfMonth: "$endtime" }, year: { $year: "$endtime" }, agentName : "$agentname"},
            count: { $sum: 1 }
          }
        }, function (err, gotCallsData){
          console.log(err);
          //console.log(gotCallsData)
          if(err) { return handleError(res, err); }
          return res.json(200, gotCallsData);
        })
    })
  } else {
    Visitorcalls.aggregate({
        $match :
        {
          room : req.user.uniqueid,
          status : "completed"
        }
      },
      {
        $group : {
          _id : { month: { $month: "$endtime" }, day: { $dayOfMonth: "$endtime" }, year: { $year: "$endtime" }, agentName : "$agentname"},
          count: { $sum: 1 }
        }
      }, function (err, gotCallsData){
        console.log(err);
        //console.log(gotCallsData)
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
  }

};

// Get statistics of calls done in department
exports.deptcallstats = function(req, res){
  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.aggregate({
          $match :
          {
            room : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }, departmentid : "$departmentid"},
            count: { $sum: 1 }
          }
        }, function (err, gotCallsData){
          if(err) { return handleError(res, err); }

          //console.log(gotCallsData)

          var deptIdArray = new Array();
          var i = 0;
          for(var row in gotCallsData){
            deptIdArray[i] =  gotCallsData[row]._id.departmentid;
            i++;
          }

          department.find({_id : {$in : deptIdArray}}, function(err3, dept){
            if(err) { return handleError(res, err); }

            res.send({gotDeptCalls : gotCallsData, deptNames : dept});

            //console.log({gotDeptCalls : gotCallsData, deptNames : dept});

          })


        })
    })
  } else {
    Visitorcalls.aggregate({
        $match :
        {
          room : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }, departmentid : "$departmentid"},
          count: { $sum: 1 }
        }
      }, function (err, gotCallsData){
        if(err) { return handleError(res, err); }

        //console.log(gotCallsData)

        var deptIdArray = new Array();
        var i = 0;
        for(var row in gotCallsData){
          deptIdArray[i] =  gotCallsData[row]._id.departmentid;
          i++;
        }

        department.find({_id : {$in : deptIdArray}}, function(err3, dept){
          if(err) { return handleError(res, err); }

          res.send({gotDeptCalls : gotCallsData, deptNames : dept});

          //console.log({gotDeptCalls : gotCallsData, deptNames : dept});

        })


      })
  }

};

// Get statistics of calls done in department
exports.deptcallstats2 = function(req, res){
  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.aggregate({
          $match :
          {
            companyid : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }, departmentid : "$departmentid"},
            count: { $sum: 1 }
          }
        }, function (err, gotCallsData){
          if(err) { return handleError(res, err); }

          //console.log(gotCallsData)

          var deptIdArray = new Array();
          var i = 0;
          for(var row in gotCallsData){
            deptIdArray[i] =  gotCallsData[row]._id.departmentid;
            i++;
          }

          department.find({_id : {$in : deptIdArray}}, function(err3, dept){
            if(err) { return handleError(res, err); }

            res.send({gotDeptCalls : gotCallsData, deptNames : dept});

            //console.log({gotDeptCalls : gotCallsData, deptNames : dept});

          })


        })
    })
  } else {
    Visitorcalls.aggregate({
        $match :
        {
          companyid : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }, departmentid : "$departmentid"},
          count: { $sum: 1 }
        }
      }, function (err, gotCallsData){
        if(err) { return handleError(res, err); }

        //console.log(gotCallsData)

        var deptIdArray = new Array();
        var i = 0;
        for(var row in gotCallsData){
          deptIdArray[i] =  gotCallsData[row]._id.departmentid;
          i++;
        }

        department.find({_id : {$in : deptIdArray}}, function(err3, dept){
          if(err) { return handleError(res, err); }

          res.send({gotDeptCalls : gotCallsData, deptNames : dept});

          //console.log({gotDeptCalls : gotCallsData, deptNames : dept});

        })


      })
  }

};

// Get statistics of calls done by date
exports.datewisecallstats = function(req, res){
  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.aggregate([
        {
          $match : {
            room : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }, callStatus : "$status"},
            count: { $sum: 1 }
          }
        }
      ], function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      })
    })
  } else {
    Visitorcalls.aggregate([
      {
        $match : {
          room : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { month: { $month: "$requesttime" }, day: { $dayOfMonth: "$requesttime" }, year: { $year: "$requesttime" }, callStatus : "$status"},
          count: { $sum: 1 }
        }
      }
    ], function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    })
  }

};

// Store data of the visitor ticket
exports.visitorjoin = function(req, res) {
  var newData = new Visitorcalls({
    username : req.body.username,
    useremail : req.body.useremail,
    question : req.body.question,
    departmentid : req.body.departmentid,
    currentPage : req.body.currentPage,
    fullurl : req.body.fullurl,
    phone : req.body.phone,
    browser : req.body.browser,
    requesttime : req.body.requesttime,
    ipAddress: req.body.ipAddress,
    country: req.body.country,
    room: req.body.room,
    request_id: req.body.request_id,
    status: 'waiting',
    webrtc_browser : req.body.webrtc_browser
  });

  newData.save(function(err){
    if(err) console.log(err);
    res.json(200, {status : 'success'});
  });
};


exports.createsession = function(req, res) {

  console.log('createsession is called');
  logger.serverLog('info', 'This is body in createsession '+ JSON.stringify(req.body) );
  
  customers.findOne({customerID: req.body.customerID}, function(err, gotCustomer){
    if (err) return res.json(501, {status: 'database error at find customer'})

    var messageChannels = [];
    messageChannels.push(req.body.messagechannel);

    if(gotCustomer) {
      
      //check if session already exists(this change is for mobile clients who are using same group same channel to continue their conv)
      
      Visitorcalls.findOne({request_id: req.body.session_id}, function(err, gotSession){
              if (err) return res.json(501, {status: 'database error at visitor calls'})
              if(!gotSession){
                      var newData = new Visitorcalls({
                      customerid : gotCustomer._id,
                      customerID : gotCustomer.customerID,
                      departmentid : req.body.departmentid,
                      messagechannel : messageChannels,
                      currentPage : req.body.currentPage, // todo will add for web customer
                      //fullurl : req.body.fullurl, // todo will add for web customer
                      //browser : req.body.browser, // todo will add for web customer
                      requesttime : req.body.requesttime,
                      ipAddress: req.body.ipAddress,
                      companyid: req.body.companyid,
                      request_id: req.body.session_id,
                      status: 'new',
                      socketid: req.body.socketid,
                      //webrtc_browser : req.body.webrtc_browser todo will add for web customer
                      platform: req.body.platform,
                      device: req.body.device,
                      device_version: req.body.device_version
                    });

                    newData.save(function(err){
                      if(err) console.log(err);
                      res.json(200, {status : 'success'});
                    });
              }
      })
    } else {
      var newCustomer = new customers({
        name : req.body.customerName,
        email : req.body.email,
        country : req.body.country,
        phone : req.body.phone,
        companyid : req.body.companyid,
        isMobileClient : req.body.isMobile,
        customerID : req.body.customerID,
      });

      newCustomer.save(function(err, customer){
        if(err) return res.json(501, {status: 'database error at new customer'})

        if(!customer) return res.json(501, {status: 'database error at find new customer'})

        var newData = new Visitorcalls({
          customerid : customer._id,
          departmentid : req.body.departmentid,
          messagechannel : messageChannels,
          customerID : customer.customerID,
          //currentPage : req.body.currentPage, // todo will add for web customer
          //fullurl : req.body.fullurl, // todo will add for web customer
          //browser : req.body.browser, // todo will add for web customer
          requesttime : req.body.requesttime,
          ipAddress: req.body.ipAddress,
          companyid: req.body.companyid,
          request_id: req.body.session_id,
          status: 'new',
          socketid: req.body.socketid,
          //webrtc_browser : req.body.webrtc_browser todo will add for web customer
          platform: req.body.platform,
          device: req.body.device,
          device_version: req.body.device_version
        });

        newData.save(function(err){
          if(err) console.log(err);
          res.json(200, {status : 'success'});
        });
      })
    }

  })

};



//create bulk sessions for mobile client

exports.createbulksession = function(req, res) {

 console.log('createbulksession is called');
 console.log(req.body);
  logger.serverLog('info', 'This is body in createsession '+ JSON.stringify(req.body) );

  customers.findOne({customerID: req.body.customerID}, function(err, gotCustomer){
    if (err) return res.json(501, {status: 'database error at find customer'})


    
    if(gotCustomer) {
      var sessionList = []
      for(var i=0;i<req.body.sessionInfo.length;i++)
      {
               var obj = req.body.sessionInfo[i]
               console.log(obj.departmentid);
                var messageChannels = [];

                messageChannels.push(obj.messagechannel);

                //check if session already exists(this change is for mobile clients who are using same group same channel to continue their conv)
                
                var newData = {
                                customerid : gotCustomer._id,
                                customerID : gotCustomer.customerID,
                                departmentid : obj.departmentid,
                                messagechannel : messageChannels,
                                currentPage : req.body.currentPage, // todo will add for web customer
                                //fullurl : req.body.fullurl, // todo will add for web customer
                                //browser : req.body.browser, // todo will add for web customer
                                requesttime : Date.now(),
                                ipAddress: req.body.ipAddress,
                                companyid: req.body.companyid,
                                request_id: obj.request_id,
                                status: 'new',
                                socketid: '',
                                //webrtc_browser : req.body.webrtc_browser todo will add for web customer
                                platform: req.body.platform,
                                device: req.body.device,
                                device_version: req.body.device_version
                              };
               sessionList.push(newData);

      }            
    Visitorcalls.create(sessionList,function(err){
       if(err) return res.json(501, {status: 'database error at new session'});
       res.json(200, {status : 'success'});
    });
    } 
    else {
      var newCustomer = new customers({
        name : req.body.customerName,
        email : req.body.email,
        country : req.body.country,
        phone : req.body.phone,
        companyid : req.body.companyid,
        isMobileClient : req.body.isMobile,
        customerID : req.body.customerID,
      });



      newCustomer.save(function(err, customer){
        if(err) return res.json(501, {status: 'database error at new customer'})

        if(!customer) return res.json(501, {status: 'database error at find new customer'})
          var sessionList = []
         for(var i=0;i<req.body.sessionInfo.length;i++)
      {
               var obj = req.body.sessionInfo[i]
               console.log(obj.departmentid);
                var messageChannels = [];
                messageChannels.push(obj.messagechannel);

                var newData = {
                  customerid : customer._id,
                  customerID : customer.customerID,
                  departmentid : obj.departmentid,
                  messagechannel : messageChannels,
                  //currentPage : req.body.currentPage, // todo will add for web customer
                  //fullurl : req.body.fullurl, // todo will add for web customer
                  //browser : req.body.browser, // todo will add for web customer
                  requesttime : Date.now(),
                  ipAddress: req.body.ipAddress,
                  companyid: req.body.companyid,
                  request_id: obj.request_id,
                  status: 'new',
                  socketid: '',
                  //webrtc_browser : req.body.webrtc_browser todo will add for web customer
                  platform: req.body.platform,
                  device: req.body.device,
                  device_version: req.body.device_version
                };
                sessionList.push(newData);
      }            
        Visitorcalls.create(sessionList,function(err){
           if(err) return res.json(501, {status: 'database error at new session'});
           res.json(200, {status : 'success'});
        });
               
     
    

  })

    }

});

};

// Store data of the visitor who was scheduled for the call
exports.scheduledvisitorjoin = function(req, res) {
  var newData = new Visitorcalls({
    username : req.body.username,
    useremail : req.body.useremail,
    agentname : req.body.agentname,
    agentemail : req.body.agentemail,
    question : req.body.question,
    currentPage : req.body.currentPage,
    fullurl : req.body.fullurl,
    phone : req.body.phone,
    browser : req.body.browser,
    departmentid: req.body.departmentid,
    ipAddress: req.body.ipAddress,
    country: req.body.country,
    room: req.body.room,
    initiator: req.body.initiator,
    requesttime: req.body.requesttime,
    request_id: req.body.request_id
  });

  newData.save(function(err){
    if(err) console.log(err);
    res.json(200, {status : 'success'});
  });
};

// Save the call summary for a ticket picked by agent
exports.callsummary = function(req, res) {
  Visitorcalls.findOne({request_id : req.body.visitorid.request_id}, function(err, gotVisitor){

    gotVisitor.callsummary = req.body.data.summary,
      gotVisitor.calldescription = req.body.data.description;
      gotVisitor.callresolution = req.body.data.resolution;

    gotVisitor.save(function(err){
      res.send('Information saved successfully. You can close the window or edit and save again.');
    });
  });
};

// todo Need to add the purpose here
exports.visitorcallsummary = function(req, res) {
  Visitorcalls.findOne({request_id : req.body.request_id}, function(err, gotSummaryData){

    gotSummaryData.callsummary = req.body.callsummary;
    gotSummaryData.calldescription = req.body.calldescription;
    gotSummaryData.callresolution = req.body.callresolution;

    gotSummaryData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};

// update the call summary record
exports.updatecallsummary = function(req, res) {
  Visitorcalls.findOne({request_id: req.body.request_id}, function (err, gotVisitor) {

    gotVisitor.callsummary = req.body.callsummary;
    gotVisitor.calldescription = req.body.calldescription;
    gotVisitor.callresolution = req.body.callresolution;

    gotVisitor.save(function (err) {
      res.send({status: 'success', msg: gotVisitor});
    });
  });
};

// Update the ticket when visitor abandoned the call
exports.visitorleft = function(req, res) {

  //console.log(req.body)

  Visitorcalls.findOne({request_id : req.body.request_id}, function(err, gotVisitorCallData){

    gotVisitorCallData.status = 'abandoned';
    gotVisitorCallData.abandonedtime = req.body.abandonedtime;

    gotVisitorCallData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};

// update the ticket information when call is picked by agent
exports.visitorcallpicked = function(req, res) {
  Visitorcalls.findOne({request_id : req.body.request_id}, function(err, gotVisitorCallData){

    gotVisitorCallData.status = 'progress';
    gotVisitorCallData.picktime = req.body.picktime;
    gotVisitorCallData.agentname = req.body.agentname;
    gotVisitorCallData.agentemail = req.body.agentemail;
    gotVisitorCallData.departmentid = req.body.departmentid;

    gotVisitorCallData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};

// visitor call completed data
exports.visitorcallcompleted = function(req, res) {
  Visitorcalls.update(
    {request_id : req.body.request_id},
    {endtime : Date.now(), status : 'completed'},
    {multi : true},
   function(err, num) {
    console.log("updated "+num);
     res.json(200, {status : 'success'});
   }
  )
  /*Visitorcalls.findOne({request_id : req.body.request_id}, function(err, gotVisitorCallData){
    gotVisitorCallData.status = 'completed';
    gotVisitorCallData.endtime = req.body.endtime;

    gotVisitorCallData.save(function(err){
      if(err) console.log(err);
    });
  })*/

};

// update the ticket information when call is picked by agent
exports.updateStatus = function(req, res) {
  Visitorcalls.findOne({request_id : req.body.request_id, companyid : req.user.uniqueid}, function(err, gotVisitorCallData){

    gotVisitorCallData.status = req.body.status;

    gotVisitorCallData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};

exports.rescheduleAbandonedSession = function(req, res) {
  console.log(req.body);
  Visitorcalls.findOne({request_id : req.body.request_id, companyid : req.body.companyid}, function(err, gotVisitorCallData){
    console.log(gotVisitorCallData);
    gotVisitorCallData.is_rescheduled = req.body.is_rescheduled;
    gotVisitorCallData.rescheduled_by = req.body.rescheduled_by;

    gotVisitorCallData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};

exports.assignToAgent = function(req, res) {
  Visitorcalls.findOne({request_id : req.body.sessionid, companyid : req.body.companyid}, function(err, gotVisitorCallData){

    gotVisitorCallData.agent_ids.push({'id' : req.body.agentAssignment.assignedto,'type' : req.body.type});
    console.log(gotVisitorCallData.agent_ids)    
    gotVisitorCallData.save(function(err){
      if(err) console.log(err);

      var newData = new agentassignments(req.body.agentAssignment);

      newData.save(function(err){
        if(err) return res.json(501, {status: 'database error on agent assignment table entry'});

        res.json(200, {status : 'success'});
      })

    });
  })
};

exports.assignToChannel = function(req, res) {
  Visitorcalls.findOne({request_id : req.body.sessionid, companyid : req.body.companyid}, function(err, gotVisitorCallData){

    gotVisitorCallData.messagechannel.push(req.body.channelAssignment.movedto);

    gotVisitorCallData.save(function(err){
      if(err) console.log(err);

      var newData = new channelassignments(req.body.channelAssignment);

      newData.save(function(err){
        if(err) return res.json(501, {status: 'database error on channel assignment table entry'});

        res.json(200, {status : 'success'});
      })

    });
  })
};

exports.pickSession = function(req, res) {
  Visitorcalls.findOne({request_id : req.body.request_id}, function(err, gotVisitorCallData){

    gotVisitorCallData.status = 'assigned';
    gotVisitorCallData.picktime = Date.now();

    gotVisitorCallData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};

exports.resolveSession = function(req, res) {
  Visitorcalls.findOne({request_id : req.body.request_id}, function(err, gotVisitorCallData){

    gotVisitorCallData.status = 'resolved';
    gotVisitorCallData.endtime = Date.now();

    gotVisitorCallData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};

// todo need to add purpose for this code
exports.schedulemakeupcall = function(req, res) {
  Visitorcalls.findOne({username : req.body.username, useremail : req.body.useremail, question : req.body.question,
    room : req.body.room, ipAddress : req.body.ipAddress, currentPage : req.body.currentPage}, function(err, gotVisitorCallData){
    //console.log(gotVisitorCallData)

    gotVisitorCallData.status = 'rescheduled';
    gotVisitorCallData.agentname = req.body.agentname;
    gotVisitorCallData.agentemail = req.body.agentemail;

    gotVisitorCallData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};

// store the socket id given to the visitor
exports.setsocketid = function(req, res) {
  console.log('going to set socket id with data: ')
  console.log(req.body)
  Visitorcalls.findOne({request_id : req.body.request_id}, function(err, gotVisitorCallData){
    if (err) return console.log(err);

    console.log(req.body.socketid)

    gotVisitorCallData.socketid = req.body.socketid;

    gotVisitorCallData.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};

// Get the calls according to the date and/or department filter
exports.getcallsinrange = function(req, res) {
  if(req.body.status === 'consolidated'){

    if(req.user.isOwner == 'Yes'){
      User.findOne({email : req.user.ownerAs}, function(err, clientUser){
        if(clientUser == null) return res.json(200, []);
        if(req.body.departmentid !== null && req.body.startdate !== null){
          Visitorcalls.find(
            {
              $or : [{status : 'waiting'}, {status : 'progress'}],
              room : clientUser.uniqueid,
              departmentid : req.body.departmentid,
              requesttime: {
                $gte: (new Date(req.body.startdate)).toISOString(),
                $lte: (new Date(req.body.enddate)).toISOString()
              }
            },

            function (err, gotCallsData){
              res.send(gotCallsData);
            }
          )
        }
        else if(req.body.departmentid != null){
          Visitorcalls.find(
            {
              $or : [{status : 'waiting'}, {status : 'progress'}],
              room : clientUser.uniqueid,
              departmentid : req.body.departmentid
            },

            function (err, gotCallsData){
              res.send(gotCallsData);
            }
          )
        }
        else if(req.body.startdate !== null){
          Visitorcalls.find(
            {
              $or : [{status : 'waiting'}, {status : 'progress'}],
              room : clientUser.uniqueid,
              requesttime: {
                $gte: (new Date(req.body.startdate)).toISOString(),
                $lte: (new Date(req.body.enddate)).toISOString()
              }
            },

            function (err, gotCallsData){
              res.send(gotCallsData);
            }
          )
        }
      })
    }
    else if(req.user.isAdmin == 'Yes'){

      if(req.body.departmentid !== null && req.body.startdate !== null){
        Visitorcalls.find(
          {
            $or : [{status : 'waiting'}, {status : 'progress'}],
            room : req.user.uniqueid,
            departmentid : req.body.departmentid,
            requesttime: {
              $gte: (new Date(req.body.startdate)).toISOString(),
              $lte: (new Date(req.body.enddate)).toISOString()
            }
          },

          function (err, gotCallsData){
            res.send(gotCallsData);
          }
        )
      }
      else if(req.body.departmentid != null){
        Visitorcalls.find(
          {
            $or : [{status : 'waiting'}, {status : 'progress'}],
            room : req.user.uniqueid,
            departmentid : req.body.departmentid
          },

          function (err, gotCallsData){
            res.send(gotCallsData);
          }
        )
      }
      else if(req.body.startdate !== null){
        Visitorcalls.find(
          {
            $or : [{status : 'waiting'}, {status : 'progress'}],
            room : req.user.uniqueid,
            requesttime: {
              $gte: (new Date(req.body.startdate)).toISOString(),
              $lte: (new Date(req.body.enddate)).toISOString()
            }
          },

          function (err, gotCallsData){
            res.send(gotCallsData);
          }
        )
      }

    }
    else if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

      department.count({companyid: req.user.uniqueid}, function(err, gotDeptCount){
        if(err) return console.log(err);

        if(gotDeptCount>0){

          deptagent.find(
            {
              companyid: req.user.uniqueid,
              agentid: req.user._id,
              deleteStatus : 'No'
            }
          ).exec(function (err, gotDeptsData){

              var departmentsIdArray = new Array();
              for(var index in gotDeptsData){
                departmentsIdArray[index] = gotDeptsData[index].deptid;
              }

              if(req.body.departmentid !== null && req.body.startdate !== null){
                Visitorcalls.find(
                  {
                    $or : [{status : 'waiting'}, {status : 'progress'}],
                    room : req.user.uniqueid,
                    departmentid : req.body.departmentid,
                    requesttime: {
                      $gte: (new Date(req.body.startdate)).toISOString(),
                      $lte: (new Date(req.body.enddate)).toISOString()
                    }
                  },
                  function (err, gotCallsData){
                    res.send(gotCallsData);
                  })
              }
              else if(req.body.departmentid != null){
                Visitorcalls.find(
                  {
                    $or : [{status : 'waiting'}, {status : 'progress'}],
                    room : req.user.uniqueid,
                    departmentid : req.body.departmentid,
                    requesttime: {
                      $gte: (new Date(req.body.startdate)).toISOString(),
                      $lte: (new Date(req.body.enddate)).toISOString()
                    }
                  },
                  function (err, gotCallsData){
                    res.send(gotCallsData);
                  }
                )
              }
              else if(req.body.startdate !== null){
                Visitorcalls.find(
                  {
                    $or : [{status : 'waiting'}, {status : 'progress'}],
                    room : req.user.uniqueid,
                    departmentid : {$in : departmentsIdArray},
                    requesttime: {
                      $gte: (new Date(req.body.startdate)).toISOString(),
                      $lte: (new Date(req.body.enddate)).toISOString()
                    }
                  },
                  function (err, gotCallsData){
                    res.send(gotCallsData);
                  }
                )
              }

            })
        }
        else{
          Visitorcalls.find(
            {
              $or : [{status : 'waiting'}, {status : 'progress'}],
              room : req.user.uniqueid,
              requesttime: {
                $gte: (new Date(req.body.startdate)).toISOString(),
                $lte: (new Date(req.body.enddate)).toISOString()
              }
            },
            function (err, gotCallsData){
              res.send(gotCallsData);
            })
        }
      })
    }


  } else {

    if(req.user.isOwner == 'Yes'){
      User.findOne({email : req.user.ownerAs}, function(err, clientUser){
        if(clientUser == null) return res.json(200, []);
        if(req.body.departmentid !== null && req.body.startdate !== null){
          Visitorcalls.find(
            {
              status : req.body.status,
              room : clientUser.uniqueid,
              departmentid : req.body.departmentid,
              requesttime: {
                $gte: (new Date(req.body.startdate)).toISOString(),
                $lte: (new Date(req.body.enddate)).toISOString()
              }
            },

            function (err, gotCallsData){
              res.send(gotCallsData);
            }
          )
        }
        else if(req.body.departmentid != null){
          Visitorcalls.find(
            {
              status : req.body.status,
              room : clientUser.uniqueid,
              departmentid : req.body.departmentid
            },

            function (err, gotCallsData){
              res.send(gotCallsData);
            }
          )
        }
        else if(req.body.startdate !== null){
          Visitorcalls.find(
            {
              status : req.body.status,
              room : clientUser.uniqueid,
              requesttime: {
                $gte: (new Date(req.body.startdate)).toISOString(),
                $lte: (new Date(req.body.enddate)).toISOString()
              }
            },

            function (err, gotCallsData){
              res.send(gotCallsData);
            }
          )
        }
      })
    }
    else if(req.user.isAdmin == 'Yes'){

      if(req.body.departmentid !== null && req.body.startdate !== null){
        Visitorcalls.find(
          {
            status : req.body.status,
            room : req.user.uniqueid,
            departmentid : req.body.departmentid,
            requesttime: {
              $gte: (new Date(req.body.startdate)).toISOString(),
              $lte: (new Date(req.body.enddate)).toISOString()
            }
          },

          function (err, gotCallsData){
            res.send(gotCallsData);
          }
        )
      }
      else if(req.body.departmentid != null){
        Visitorcalls.find(
          {
            status : req.body.status,
            room : req.user.uniqueid,
            departmentid : req.body.departmentid
          },

          function (err, gotCallsData){
            res.send(gotCallsData);
          }
        )
      }
      else if(req.body.startdate !== null){
        Visitorcalls.find(
          {
            status : req.body.status,
            room : req.user.uniqueid,
            requesttime: {
              $gte: (new Date(req.body.startdate)).toISOString(),
              $lte: (new Date(req.body.enddate)).toISOString()
            }
          },

          function (err, gotCallsData){
            res.send(gotCallsData);
          }
        )
      }

    }
    else if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

      department.count({companyid: req.user.uniqueid}, function(err, gotDeptCount){
        if(err) return console.log(err);

        if(gotDeptCount>0){

          deptagent.find(
            {
              companyid: req.user.uniqueid,
              agentid: req.user._id,
              deleteStatus : 'No'
            }
          ).exec(function (err, gotDeptsData){

              var departmentsIdArray = new Array();
              for(var index in gotDeptsData){
                departmentsIdArray[index] = gotDeptsData[index].deptid;
              }

              if(req.body.departmentid !== null && req.body.startdate !== null){
                Visitorcalls.find(
                  {
                    status : req.body.status,
                    room : req.user.uniqueid,
                    departmentid : req.body.departmentid,
                    requesttime: {
                      $gte: (new Date(req.body.startdate)).toISOString(),
                      $lte: (new Date(req.body.enddate)).toISOString()
                    }
                  },
                  function (err, gotCallsData){
                    res.send(gotCallsData);
                  })
              }
              else if(req.body.departmentid != null){
                Visitorcalls.find(
                  {
                    status : req.body.status,
                    room : req.user.uniqueid,
                    departmentid : req.body.departmentid,
                    requesttime: {
                      $gte: (new Date(req.body.startdate)).toISOString(),
                      $lte: (new Date(req.body.enddate)).toISOString()
                    }
                  },
                  function (err, gotCallsData){
                    res.send(gotCallsData);
                  }
                )
              }
              else if(req.body.startdate !== null){
                Visitorcalls.find(
                  {
                    status : req.body.status,
                    room : req.user.uniqueid,
                    departmentid : {$in : departmentsIdArray},
                    requesttime: {
                      $gte: (new Date(req.body.startdate)).toISOString(),
                      $lte: (new Date(req.body.enddate)).toISOString()
                    }
                  },
                  function (err, gotCallsData){
                    res.send(gotCallsData);
                  }
                )
              }

            })
        }
        else{
          Visitorcalls.find(
            {
              status : req.body.status,
              room : req.user.uniqueid,
              requesttime: {
                $gte: (new Date(req.body.startdate)).toISOString(),
                $lte: (new Date(req.body.enddate)).toISOString()
              }
            },
            function (err, gotCallsData){
              res.send(gotCallsData);
            })
        }
      })
    }

  }
};

// Gets the calls picked by the user
exports.mypickedcalls = function(req, res){

  if(req.user.isOwner == 'Yes'){
    User.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Visitorcalls.find({agentemail : clientUser.email, status : 'completed'}, function (err, gotCallsData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotCallsData);
      });
    })
  } else {
    Visitorcalls.find({agentemail : req.user.email, status : 'completed'}, function (err, gotCallsData){
      if(err) { return handleError(res, err); }
      return res.json(200, gotCallsData);
    });
  }


};

// Get a single visitorcalls
exports.show = function(req, res) {
  Visitorcalls.findOne({request_id : req.body.request_id}, function (err, visitorcalls) {
    if(err) { return handleError(res, err); }
    if(!visitorcalls) { return res.send(404); }
    return res.json(visitorcalls);
  });
};

// Creates a new visitorcalls in the DB.
exports.create = function(req, res) {
  Visitorcalls.create(req.body, function(err, visitorcalls) {
    if(err) { return handleError(res, err); }
    return res.json(201, visitorcalls);
  });
};

// Updates an existing visitorcalls in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Visitorcalls.findById(req.params.id, function (err, visitorcalls) {
    if (err) { return handleError(res, err); }
    if(!visitorcalls) { return res.send(404); }
    var updated = _.merge(visitorcalls, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, visitorcalls);
    });
  });
};

// Deletes a visitorcalls from the DB.
exports.destroy = function(req, res) {
  Visitorcalls.findById(req.params.id, function (err, visitorcalls) {
    if(err) { return handleError(res, err); }
    if(!visitorcalls) { return res.send(404); }
    visitorcalls.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};



// Get a sessions of a customer
exports.getcustomersessions = function(req, res) {
  console.log('get customer sessions is called');
  console.log(req.body.customerid);
  Visitorcalls.find({customerID : req.body.customerid}, function (err, visitorcalls) {
    if(err) { return handleError(res, err); }
    if(!visitorcalls) { return res.send(404); }
    return res.json(visitorcalls);
  });
};


function handleError(res, err) {
  return res.send(500, err);
}
