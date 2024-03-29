'use strict';

var _ = require('lodash');
var Department = require('./department.model');
var deptagent = require('../deptagent/deptagent.model');
var deptteam = require('../deptteam/deptteam.model');
var user = require('../user/user.model');
var companyprofile = require('../companyprofile/companyprofile.model');
var MessageChannel = require('../messagechannels/messagechannels.model');
var Sessions = require('../visitorcalls/visitorcalls.model');
var logger = require('../../components/logger/logger');
// Get list of departments
exports.index = function(req, res) {
  if(req.user.isOwner == 'Yes'){
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Department.find({companyid : clientUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, departments){

        if(err) { return handleError(res, err); }
        return res.json(200, departments);

      })
    })
  } else{

    Department.find({companyid : req.user.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, departments){

      if(err) { return handleError(res, err); }
      return res.json(200, departments);

    })
  }

};

// Get list of user's departments
exports.mydepartments = function(req, res){
  if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    deptagent.find({
      companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
    }).populate('agentid deptid').exec(function (err, departments){
      if(err) { return handleError(res, err); }
      return res.json(200, departments);
    })
  }
  else if(req.user.isAdmin == 'Yes' ){

    Department.find({companyid : req.user.uniqueid, createdby : req.user._id, deleteStatus: 'No'}, function(err, departments){
      if(err) { return handleError(res, err); }
     return res.json(200, departments);
    })


  } else if(req.user.isOwner == 'Yes'){
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Department.find({companyid : clientUser.uniqueid, createdby : clientUser._id, deleteStatus: 'No'}, function(err, departments){
        if(err) { return handleError(res, err); }
        return res.json(200, departments);
      })
    })
  }
};


// By joining Teams with Groups/Departments instead of Agents this endpoint is not required.

exports.mydepartmentsKiboEngage = function(req, res){
  if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    deptagent.find({
      companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
    }).populate('agentid deptid').exec(function (err, departments){
      if(err) { return handleError(res, err); }
      return res.json(200, departments);
    })
  }
  else if(req.user.isAdmin == 'Yes' ){

    Department.find({companyid : req.user.uniqueid, createdby : req.user._id, deleteStatus: 'No'}, function(err, departments){
      if(err) { return handleError(res, err); }
    deptagent.find({
      companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
    }).populate('agentid deptid').exec(function (err, agentdepartments){
      if(err) { return handleError(res, err); }
      return res.json(200, {'createdDept' : departments,'agentDept' : agentdepartments});
    })
    })





  } else if(req.user.isOwner == 'Yes'){
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Department.find({companyid : clientUser.uniqueid, createdby : clientUser._id, deleteStatus: 'No'}, function(err, departments){
        if(err) { return handleError(res, err); }
        return res.json(200, departments);
      })
    })
  }
};

// Get a single department
exports.show = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, {});
      Department.findById(req.params.id).populate('createdby').exec(function (err, department){
        if(err) { return handleError(res, err); }
        if(!department) { return res.send(404); }
        return res.json(department);
      })
    })
  } else{

    Department.findById(req.params.id).populate('createdby').exec(function (err, department){
      if(err) { return handleError(res, err); }
      if(!department) { return res.send(404); }
      return res.json(department);
    })
  }

};

// Creates a new department in the DB.
exports.create = function(req, res) {
  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
        if(clientUser == null) return res.json(200, {status : 'danger'});
        var newDepartment = new Department({
          deptname : req.body.deptname,
          deptCapital : req.body.deptname.toUpperCase(),
          deptdescription: req.body.deptdescription,
          companyid : clientUser.uniqueid,
          createdby : clientUser._id
        });


        Department.count({deptCapital : req.body.deptname.toUpperCase(), companyid : clientUser.uniqueid}, function(err, gotCount){

          if(gotCount > 0)
            res.send({status: 'danger', msg: 'Can not create duplicate Groups.'});
          else{

            companyprofile.findOne({companyid: clientUser.uniqueid},function(err, gotMaxDept){
              if(err) return console.log(err);

              Department.count({companyid: clientUser.uniqueid, deleteStatus: 'No'}, function(err2, totalDeptsCount){

                if(totalDeptsCount < gotMaxDept.maxnumberofdepartment){
                  newDepartment.save(function(err2){
                    if(err2) return console.log(err2);
                    Department.find({companyid : clientUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err3, gotDepartmentsData){
                      if(err3) return console.log(err3);

                      res.send({status: 'success', msg: gotDepartmentsData});
                    })
                  })


                }
                else{
                  res.send({status: 'danger', msg: 'Can not create more than '+gotMaxDept.maxnumberofdepartment+' groups'});
                }
              })

            })


          }
        })
      })
    } else if(gotUser.isAdmin == 'Yes'){

      var newDepartment = new Department({
        deptname : req.body.deptname,
        deptCapital : req.body.deptname.toUpperCase(),
        deptdescription: req.body.deptdescription,
        companyid : req.user.uniqueid,
        createdby : req.user._id
      });


      Department.count({deptCapital : req.body.deptname.toUpperCase(), companyid : req.user.uniqueid}, function(err, gotCount){

        if(gotCount > 0)
          res.send({status: 'danger', msg: 'Can not create duplicate Groups.'});
        else{

          companyprofile.findOne({companyid: req.user.uniqueid},function(err, gotMaxDept){
            if(err) return console.log(err);

            Department.count({companyid: req.user.uniqueid, deleteStatus: 'No'}, function(err2, totalDeptsCount){

              if(totalDeptsCount < gotMaxDept.maxnumberofdepartment){
                newDepartment.save(function(err2){
                  if(err2) return console.log(err2);
                  Department.find({companyid : req.user.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err3, gotDepartmentsData){
                    if(err3) return console.log(err3);

                    res.send({status: 'success', msg: gotDepartmentsData});
                  })
                })


              }
              else{
                res.send({status: 'danger', msg: 'Can not create more than '+gotMaxDept.maxnumberofdepartment+' groups'});
              }
            })

          })


        }
      })
    }
    else
      res.json(501, {});
  })
};

// Updates an existing department in the DB.
exports.update = function(req, res) {
  logger.serverLog('info', 'This is body in editteam '+ JSON.stringify(req.body) );
  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
        Department.count({deptname : req.body.dept.deptname, companyid : clientUser.uniqueid, _id : {$ne : req.body.dept._id}}, function(err, gotCount){
          if(gotCount > 0){
            res.send({status:'danger', msg:'Group with the given name already exists'})
          } else {

            Department.findById(req.body.dept._id, function(err1, gotDepartment){
              if(err1) return console.log(err1)

              gotDepartment.deptname = req.body.dept.deptname;
              gotDepartment.deptdescription = req.body.dept.deptdescription;

              gotDepartment.save(function(err2){
                if(err2) return console.log(err2)

                deptteam.remove({deptid : req.body.dept._id}, function(err3){
                  if(err3) return console.log(err3)

                  for(var agent in req.body.teamagents){

                    var newdeptagent = new deptteam({
                      deptid : req.body.dept._id,
                      companyid : clientUser.uniqueid,
                      teamid : req.body.teamagents[agent]._id
                    });

                    newdeptagent.save(function(err4){
                      if(err4) return console.log(err4)
                    })

                  }

                  res.send({status:'success', msg:'Information has been updated successfully'})

                })

              })

            });

          }
        })
      })
    }
    else if(gotUser.isAdmin == 'Yes' || gotUser.isSupervisor == 'Yes'){

      Department.count({deptname : req.body.dept.deptname, companyid : req.user.uniqueid, _id : {$ne : req.body.dept._id}}, function(err, gotCount){
        if(gotCount > 0){
          res.send({status:'danger', msg:'Group with the given name already exists'})
        } else {

          Department.findById(req.body.dept._id, function(err1, gotDepartment){
            if(err1) return console.log(err1)

            gotDepartment.deptname = req.body.dept.deptname;
            gotDepartment.deptdescription = req.body.dept.deptdescription;

            gotDepartment.save(function(err2){
              if(err2) return console.log(err2)

              deptteam.remove({deptid : req.body.dept._id}, function(err3){
                if(err3) return console.log(err3)

                for(var agent in req.body.teamagents){

                  var newdeptagent = new deptteam({
                    deptid : req.body.dept._id,
                    companyid : req.user.uniqueid,
                    teamid : req.body.teamagents[agent]._id
                  });

                  newdeptagent.save(function(err4){
                    if(err4) return console.log(err4)
                  })

                }

                res.send({status:'success', msg:'Information has been updated successfully'})

              })

            })

          });

        }
      })
    }
    else
      res.json(501, {});

  })
};

// Deletes a department from the DB.
exports.destroy = function(req, res) {
  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
        Department.findById(req.params.id, function(err, gotDepartment){
          if(err) return console.log(err);

          var today = new Date();
          var deptDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

          gotDepartment.deleteStatus = 'Yes';
          gotDepartment.deptname = 'deleted '+deptDeleteDate +' '+gotDepartment.deptname;
          gotDepartment.deptCapital = 'deleted '+deptDeleteDate +' '+ gotDepartment.deptCapital

          gotDepartment.save(function(err){
            if(err) return console.log(err);

            deptteam.update({deptid : gotDepartment._id, companyid : clientUser.uniqueid},
              {deleteStatus : 'Yes'}, {multi : true}, function(err){
                if(err) return console.log(err);

                Department.find({companyid : clientUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, gotDepartmentsData){

                  res.send({status: 'success', msg: gotDepartmentsData});

                })


              })

          })


        })
      })
    }
    else if(gotUser.isAdmin == 'Yes'){

      Department.findById(req.params.id, function(err, gotDepartment){
        if(err) return console.log(err);

        var today = new Date();
        var deptDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

        gotDepartment.deleteStatus = 'Yes';
        gotDepartment.deptname = 'deleted '+deptDeleteDate +' '+gotDepartment.deptname;
        gotDepartment.deptCapital = 'deleted '+deptDeleteDate +' '+ gotDepartment.deptCapital

        gotDepartment.save(function(err){
          if(err) return console.log(err);

          deptteam.update({deptid : gotDepartment._id, companyid : gotUser.uniqueid},
            {deleteStatus : 'Yes'}, {multi : true}, function(err){
              if(err) return console.log(err);

              Department.find({companyid : req.user.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, gotDepartmentsData){

                res.send({status: 'success', msg: gotDepartmentsData});

              })


            })

        })


      })

    }
    else
      res.json(501, {});
  })
};

function handleError(res, err) {
  return res.send(500, err);
}



// create group with default subgroup

// Creates a new department in the DB.
exports.createKiboengage = function(req, res) {
  logger.serverLog('info', 'This is body in create group '+ JSON.stringify(req.body) );

  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
        if(clientUser == null) return res.json(200, {status : 'danger'});
        var newDepartment = new Department({
          deptname : req.body.deptname,
          deptCapital : req.body.deptname.toUpperCase(),
          deptdescription: req.body.deptdescription,
          companyid : clientUser.uniqueid,
          createdby : clientUser._id
        });


        Department.count({deptCapital : req.body.deptname.toUpperCase(), companyid : clientUser.uniqueid}, function(err, gotCount){

          if(gotCount > 0)
            res.send({status: 'danger', msg: 'Can not create duplicate Groups.'});
          else{

            companyprofile.findOne({companyid: clientUser.uniqueid},function(err, gotMaxDept){
              if(err) return console.log(err);

              Department.count({companyid: clientUser.uniqueid, deleteStatus: 'No'}, function(err2, totalDeptsCount){

                if(totalDeptsCount < gotMaxDept.maxnumberofdepartment){
                  newDepartment.save(function(err2,record){
                    if(err2) return console.log(err2);

                    // create dept agents
                  if(req.body.teamagents){
                    logger.serverLog('info', 'Inside teamagents '+ JSON.stringify(req.body.teamagents) );

                    for(var team in req.body.teamagents){
                      logger.serverLog('info', 'Inside teamagents '+ JSON.stringify(team) );

                    var newteamagent = new deptteam({
                      deptid : record._id,
                      companyid : clientUser.uniqueid,
                      teamid : req.body.teamagents[team]._id
                    });

                      newteamagent.save(function(err4){
                        if(err4) return console.log(err4)
                      })

                    }
                  }
                    //create default message channel

                     var channel = new MessageChannel({
                       msg_channel_name : 'General',
                       msg_channel_description: 'This subgroup is for general discussions',
                       companyid : record.companyid,
                       groupid : record._id,
                       createdby : record.createdby

                     });
                     console.log(channel);
                     channel.save(function(err4,record2){
                         if(err4) return console.log(err4);
                         Department.find({companyid : clientUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err3, gotDepartmentsData){
                          if(err3) return console.log(err3);

                          res.send({status: 'success', msg: gotDepartmentsData,group : record,subgroup : record2});
                    })
                     })
                  })


                }
                else{
                  res.send({status: 'danger', msg: 'Can not create more than '+gotMaxDept.maxnumberofdepartment+' groups'});
                }
              })

            })


          }
        })
      })
    } else if(gotUser.isAdmin == 'Yes'){

      var newDepartment = new Department({
        deptname : req.body.deptname,
        deptCapital : req.body.deptname.toUpperCase(),
        deptdescription: req.body.deptdescription,
        companyid : req.user.uniqueid,
        createdby : req.user._id
      });


      Department.count({deptCapital : req.body.deptname.toUpperCase(), companyid : req.user.uniqueid}, function(err, gotCount){

        if(gotCount > 0)
          res.send({status: 'danger', msg: 'Can not create duplicate Groups.'});
        else{

          companyprofile.findOne({companyid: req.user.uniqueid},function(err, gotMaxDept){
            if(err) return console.log(err);

            Department.count({companyid: req.user.uniqueid, deleteStatus: 'No'}, function(err2, totalDeptsCount){

              if(totalDeptsCount < gotMaxDept.maxnumberofdepartment){
                newDepartment.save(function(err2,record){
                  if(err2) return console.log(err2);
                        // create dept agents


                     // create dept agents
                  if(req.body.teamagents){
                    logger.serverLog('info', 'Inside teamagents '+ JSON.stringify(req.body.teamagents) );

                    for(var team in req.body.teamagents){
                      logger.serverLog('info', 'Inside teamagents '+ JSON.stringify(team) );

                    var newteamagent = new deptteam({
                      deptid : record._id,
                      companyid : record.companyid,
                      teamid : req.body.teamagents[team]._id
                    });

                      newteamagent.save(function(err4){
                        if(err4) return console.log(err4)
                      })




                    }
                  }
                    var channel = new MessageChannel({
                       msg_channel_name : 'General',
                       msg_channel_description: 'This subgroup is for general discussions',
                       companyid : record.companyid,
                       groupid : record._id,
                       createdby : record.createdby

                     });
                     console.log(channel);
                     channel.save(function(err4,record2){
                         if(err4) return console.log(err4);
                          Department.find({companyid : req.user.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err3, gotDepartmentsData){
                            if(err3) return console.log(err3);

                            res.send({status: 'success', msg: gotDepartmentsData,group : record,subgroup : record2});
                          })
                     })
                })


              }
              else{
                res.send({status: 'danger', msg: 'Can not create more than '+gotMaxDept.maxnumberofdepartment+' groups'});
              }
            })

          })


        }
      })
    }
    else
      res.json(501, {});
  })
};



/************ Delete KiboEngage Department along with subgroups ********/
// Deletes a department from the DB.
exports.destroyKiboengage = function(req, res) {
  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
        Department.findById(req.params.id, function(err, gotDepartment){
          if(err) return console.log(err);

          var today = new Date();
          var deptDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

          gotDepartment.deleteStatus = 'Yes';
          gotDepartment.deptname = 'deleted '+deptDeleteDate +' '+gotDepartment.deptname;
          gotDepartment.deptCapital = 'deleted '+deptDeleteDate +' '+ gotDepartment.deptCapital

          gotDepartment.save(function(err){
            if(err) return console.log(err);

            deptteam.update({deptid : gotDepartment._id, companyid : clientUser.uniqueid},
              {deleteStatus : 'Yes'}, {multi : true}, function(err){
                if(err) return console.log(err);

                MessageChannel.update({groupid : gotDepartment._id, companyid : clientUser.uniqueid},
                       {deleteStatus : 'Yes'}, {multi : true}, function(err){
                              if(err) return console.log(err);
                               Sessions.update({departmentid : gotDepartment._id, companyid : clientUser.uniqueid},
                                        {deleteStatus : 'Yes'}, {multi : true}, function(err){
                                                  if(err) return console.log(err);
                                                  Department.find({companyid : clientUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, gotDepartmentsData){

                                                    res.send({status: 'success', msg: gotDepartmentsData});

                                                  })

              })
            })
                })


          })


        })
      })
    }
    else if(gotUser.isAdmin == 'Yes'){

      Department.findById(req.params.id, function(err, gotDepartment){
        if(err) return console.log(err);

        var today = new Date();
        var deptDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

        gotDepartment.deleteStatus = 'Yes';
        gotDepartment.deptname = 'deleted '+deptDeleteDate +' '+gotDepartment.deptname;
        gotDepartment.deptCapital = 'deleted '+deptDeleteDate +' '+ gotDepartment.deptCapital

        gotDepartment.save(function(err){
          if(err) return console.log(err);

          deptteam.update({deptid : gotDepartment._id, companyid : gotUser.uniqueid},
            {deleteStatus : 'Yes'}, {multi : true}, function(err){
              if(err) return console.log(err);

                MessageChannel.update({groupid : gotDepartment._id, companyid : gotUser.uniqueid},
                       {deleteStatus : 'Yes',msg_channel_name : 'deleted -' + gotDepartment.deptname}, {multi : true}, function(err){
                              if(err) return console.log(err);
                               Sessions.update({departmentid : gotDepartment._id, companyid : gotUser.uniqueid},
                                        {deleteStatus : 'Yes'}, {multi : true}, function(err){
                                                  if(err) return console.log(err);
                                                  Department.find({companyid : gotUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, gotDepartmentsData){

                                                    res.send({status: 'success', msg: gotDepartmentsData});

                                                  })
                                                })
            })
                })


          })

        })


    }
    else
      res.json(501, {});
  })
};


exports.deletedepts = function(req, res) {
  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
        res.send({status: 'success', msg: req.body.ids});
        req.body.ids.forEach(function(itemId){
          Department.findById(itemId, function(err, gotDepartment){
            if(err) return console.log(err);

            var today = new Date();
            var deptDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

            gotDepartment.deleteStatus = 'Yes';
            gotDepartment.deptname = 'deleted '+deptDeleteDate +' '+gotDepartment.deptname;
            gotDepartment.deptCapital = 'deleted '+deptDeleteDate +' '+ gotDepartment.deptCapital

            gotDepartment.save(function(err){
              if(err) return console.log(err);

              deptteam.update({deptid : gotDepartment._id, companyid : clientUser.uniqueid},
                {deleteStatus : 'Yes'}, {multi : true}, function(err){
                  if(err) return console.log(err);

                  MessageChannel.update({groupid : gotDepartment._id, companyid : clientUser.uniqueid},
                         {deleteStatus : 'Yes'}, {multi : true}, function(err){
                                if(err) return console.log(err);
                                 Sessions.update({departmentid : gotDepartment._id, companyid : clientUser.uniqueid},
                                          {deleteStatus : 'Yes'}, {multi : true}, function(err){
                                                    if(err) return console.log(err);
                                                    Department.find({companyid : clientUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, gotDepartmentsData){

                                                    })

                })
              })
                  })


            })


          })

        });
      })
    }
    else if(gotUser.isAdmin == 'Yes'){

      res.send({status: 'success', msg: req.body.ids});
      req.body.ids.forEach(function(itemId){
        Department.findById(itemId, function(err, gotDepartment){
          if(err) return console.log(err);

          var today = new Date();
          var deptDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

          gotDepartment.deleteStatus = 'Yes';
          gotDepartment.deptname = 'deleted '+deptDeleteDate +' '+gotDepartment.deptname;
          gotDepartment.deptCapital = 'deleted '+deptDeleteDate +' '+ gotDepartment.deptCapital

          gotDepartment.save(function(err){
            if(err) return console.log(err);

            deptteam.update({deptid : gotDepartment._id, companyid : gotUser.uniqueid},
              {deleteStatus : 'Yes'}, {multi : true}, function(err){
                if(err) return console.log(err);

                  MessageChannel.update({groupid : gotDepartment._id, companyid : gotUser.uniqueid},
                         {deleteStatus : 'Yes',msg_channel_name : 'deleted -' + gotDepartment.deptname}, {multi : true}, function(err){
                                if(err) return console.log(err);
                                 Sessions.update({departmentid : gotDepartment._id, companyid : gotUser.uniqueid},
                                          {deleteStatus : 'Yes'}, {multi : true}, function(err){
                                                    if(err) return console.log(err);
                                                    Department.find({companyid : gotUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, gotDepartmentsData){

                                                    })
                                                  })
              })
                  })


            })

          })


      });

    }
    else
      res.json(501, {});
  })
};


/// *** Create team for Fb messages


// Creates a new department in the DB.
exports.createKiboengagefb = function(req, res) {
  logger.serverLog('info', 'This is body in createteam fb '+ JSON.stringify(req.body) );

  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
        if(clientUser == null) return res.json(200, {status : 'danger'});
        var newDepartment = new Department({
          deptname : req.body.deptname,
          deptCapital : req.body.deptname.toUpperCase(),
          deptdescription: req.body.deptdescription,
          companyid : clientUser.uniqueid,
          createdby : clientUser._id,
          isFbTeam : "true",
          fbPageID : req.body.fbPageID,
        });


        Department.count({deptCapital : req.body.deptname.toUpperCase(), companyid : clientUser.uniqueid}, function(err, gotCount){

          if(gotCount > 0)
            res.send({status: 'danger', msg: 'Can not create duplicate Groups.'});
          else{

            companyprofile.findOne({companyid: clientUser.uniqueid},function(err, gotMaxDept){
              if(err) return console.log(err);

              Department.count({companyid: clientUser.uniqueid, deleteStatus: 'No'}, function(err2, totalDeptsCount){

                if(totalDeptsCount < gotMaxDept.maxnumberofdepartment){
                  newDepartment.save(function(err2,record){
                    if(err2) return console.log(err2);

                    // create dept agents
                  if(req.body.deptagents){
                    logger.serverLog('info', 'Inside deptagents '+ JSON.stringify(req.body.deptagents) );

                    for(var agent in req.body.deptagents){
                      logger.serverLog('info', 'Inside deptagents '+ JSON.stringify(agent) );

                    var newdeptagent = new deptagent({
                      deptid : record._id,
                      companyid : clientUser.uniqueid,
                      agentid : req.body.deptagents[agent]._id
                    });

                      newdeptagent.save(function(err4){
                        if(err4) return console.log(err4)
                      })

                    }
                  }


                  })


                }
                else{
                  res.send({status: 'danger', msg: 'Can not create more than '+gotMaxDept.maxnumberofdepartment+' groups'});
                }
              })

            })


          }
        })
      })
    } else if(gotUser.isAdmin == 'Yes'){

      var newDepartment = new Department({
        deptname : req.body.deptname,
        deptCapital : req.body.deptname.toUpperCase(),
        deptdescription: req.body.deptdescription,
        companyid : req.user.uniqueid,
        createdby : req.user._id,
        isFbTeam : "true",
        fbPageID : req.body.fbPageID,
      });


      Department.count({deptCapital : req.body.deptname.toUpperCase(), companyid : req.user.uniqueid}, function(err, gotCount){

        if(gotCount > 0)
          res.send({status: 'danger', msg: 'Can not create duplicate Groups.'});
        else{

          companyprofile.findOne({companyid: req.user.uniqueid},function(err, gotMaxDept){
            if(err) return console.log(err);

            Department.count({companyid: req.user.uniqueid, deleteStatus: 'No'}, function(err2, totalDeptsCount){

              if(totalDeptsCount < gotMaxDept.maxnumberofdepartment){
                newDepartment.save(function(err2,record){
                  if(err2) return console.log(err2);
                        // create dept agents
                  if(req.body.deptagents){
                    logger.serverLog('info', 'Inside deptagents '+ JSON.stringify(req.body.deptagents) );

                    for(var agent in req.body.deptagents){
                      logger.serverLog('info', 'Inside deptagents '+ JSON.stringify(agent) );

                    var newdeptagent = new deptagent({
                      deptid : record._id,
                      companyid : record.companyid,
                      agentid : req.body.deptagents[agent]._id
                    });

                      newdeptagent.save(function(err4){
                        if(err4) return console.log(err4)
                      })

                    }
                  }

                })


              }
              else{
                res.send({status: 'danger', msg: 'Can not create more than '+gotMaxDept.maxnumberofdepartment+' groups'});
              }
            })

          })


        }
      })
    }
    else
      res.json(501, {});
  })
};
