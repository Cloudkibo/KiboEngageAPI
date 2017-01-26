'use strict';

var _ = require('lodash');
var Group = require('./group.model');
var groupagent = require('../groupagent/groupagent.model');
var user = require('../user/user.model');
var companyprofile = require('../companyprofile/companyprofile.model');
var MessageChannel = require('../messagechannels/messagechannels.model');

// Get list of Groups
exports.index = function(req, res) {
  if(req.user.isOwner == 'Yes'){
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Group.find({companyid : clientUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, groups){

        if(err) { return handleError(res, err); }
        return res.json(200, groups);

      })
    })
  } else if(req.user.isAdmin == 'Yes'){

    Group.find({companyid : req.user.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, groups){

      if(err) { return handleError(res, err); }
      return res.json(200, groups);

    })
  }
  else if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    groupagent.find({
      companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
    }).exec(function (err, gotDeptsData){

      var groupsIdArray = new Array();

      for(var index in gotDeptsData){

        groupsIdArray[index] = gotDeptsData[index].groupid;

      }

      Group.find({companyid : req.user.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, groups){

        if(err) { return handleError(res, err); }
        return res.json(200, groups);

      })

    })
  }
  else
    res.json(500, {});
};


exports.mygroups = function(req, res){
  if(req.user.isAgent == 'Yes' || req.user.isSupervisor == 'Yes'){

    groupagent.find({
      companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
    }).populate('agentid groupid').exec(function (err, groups){
      if(err) { return handleError(res, err); }
      return res.json(200, groups);
    })
  }
  else if(req.user.isAdmin == 'Yes' ){
  
    Group.find({companyid : req.user.uniqueid, createdby : req.user._id, deleteStatus: 'No'}, function(err, groups){
      if(err) { return handleError(res, err); }
    groupagent.find({
      companyid: req.user.uniqueid, agentid: req.user._id, deleteStatus : 'No'
    }).populate('agentid groupid').exec(function (err, agentgroups){
      if(err) { return handleError(res, err); }
      return res.json(200, {'createdDept' : groups,'agentDept' : agentgroups});
    })
    })
    
    
    
    
     
  } else if(req.user.isOwner == 'Yes'){
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Group.find({companyid : clientUser.uniqueid, createdby : clientUser._id, deleteStatus: 'No'}, function(err, groups){
        if(err) { return handleError(res, err); }
        return res.json(200, groups);
      })
    })
  }
};


// Get a single group
exports.show = function(req, res) {

  if(req.user.isOwner == 'Yes'){
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, {});
      Group.findById(req.params.id).populate('createdby').exec(function (err, group){
        if(err) { return handleError(res, err); }
        if(!group) { return res.send(404); }
        return res.json(group);
      })
    })
  } else if(req.user.isAdmin == 'Yes'){

    Group.findById(req.params.id).populate('createdby').exec(function (err, group){
      if(err) { return handleError(res, err); }
      if(!group) { return res.send(404); }
      return res.json(group);
    })
  }
  else if(req.user.isSupervisor == 'Yes' || req.user.isAgent === 'Yes'){

    groupagent.count({groupid : req.params.id, agentid : req.user._id}, function(err, gotCount){
      if (err) { return handleError(res, err); }

      if(gotCount>0){

        Group.findById(req.params.id).populate('createdby').exec(function (err, group){
          if(err) { return handleError(res, err); }
          if(!group) { return res.send(404); }
          return res.json(group);
        })
      }
      else {
        res.json(501, {});
      }

    })

  }
  else
    res.json(501, {});

};

// Creates a new group in the DB.
exports.create = function(req, res) {
  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
        if(clientUser == null) return res.json(200, {status : 'danger'});
        var newGroup = new Group({
          groupname : req.body.groupname,
          groupdescription: req.body.groupdescription,
          companyid : clientUser.uniqueid,
          createdby : clientUser._id,
          status : req.body.status,
        });


        Group.count({groupname : req.body.groupname, companyid : clientUser.uniqueid}, function(err, gotCount){

          if(gotCount > 0)
            res.send({status: 'danger', msg: 'Cannot create duplicate Groups.'});
          else{

                newGroup.save(function(err2){
                    if(err2) return console.log(err2);
                    Group.find({companyid : clientUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err3, gotGroupsData){
                      if(err3) return console.log(err3);

                      res.send({status: 'success', msg: gotGroupsData});
                    })
                  })

          }
        })
      })
    }
     else if(gotUser.isAdmin == 'Yes'){


       var newGroup = new Group({
          groupname : req.body.groupname,
          groupdescription: req.body.groupdescription,
          companyid : req.user.uniqueid,
          createdby : req.user._id,
          status : req.body.status,
        });


      

      Group.count({groupname : req.body.groupname, companyid : req.user.uniqueid}, function(err, gotCount){

        if(gotCount > 0)
          res.send({status: 'danger', msg: 'Can not create duplicate Groups.'});
        else{

             newGroup.save(function(err2){
                  if(err2) return console.log(err2);
                  Group.find({companyid : req.user.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err3, gotGroupsData){
                    if(err3) return console.log(err3);

                    res.send({status: 'success', msg: gotGroupsData});
                  })
                })

        }
      })
    }
    else
      res.json(501, {});
  })
};

// Updates an existing group in the DB.
exports.update = function(req, res) {
  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
        Group.count({deptname : req.body.group.groupname, companyid : clientUser.uniqueid, _id : {$ne : req.body.group._id}}, function(err, gotCount){
          if(gotCount > 0){
            res.send({status:'danger', msg:'Group with the given name already exists'})
          } else {

            Group.findById(req.body.group._id, function(err1, gotGroup){
              if(err1) return console.log(err1)

              gotGroup.groupname = req.body.group.groupname;
              gotGroup.groupdescription = req.body.group.groupdescription;
              gotGroup.status = req.body.group.status;

              gotGroup.save(function(err2){
                if(err2) return console.log(err2)

                groupagent.remove({groupid : req.body.group._id}, function(err3){
                  if(err3) return console.log(err3)

                  for(var agent in req.body.groupagents){

                    var newgroupagent = new groupagent({
                      groupid : req.body.group._id,
                      companyid : clientUser.uniqueid,
                      agentid : req.body.groupagents[agent]._id
                    });

                    newgroupagent.save(function(err4){
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

      Group.count({groupname : req.body.group.groupname, companyid : req.user.uniqueid, _id : {$ne : req.body.group._id}}, function(err, gotCount){
        if(gotCount > 0){
          res.send({status:'danger', msg:'Group with the given name already exists'})
        } else {

          Group.findById(req.body.group._id, function(err1, gotGroup){
            if(err1) return console.log(err1)

            gotGroup.groupname = req.body.group.groupname;
            gotGroup.groupdescription = req.body.group.groupdescription;
            gotGroup.status = req.body.group.status;


            gotGroup.save(function(err2){
              if(err2) return console.log(err2)

              groupagent.remove({groupid : req.body.group._id}, function(err3){
                if(err3) return console.log(err3)

                for(var agent in req.body.groupagents){

                  var newgroupagent = new groupagent({
                    groupid : req.body.group._id,
                    companyid : req.user.uniqueid,
                    agentid : req.body.groupagents[agent]._id
                  });

                  newgroupagent.save(function(err4){
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

// Deletes a group from the DB.
exports.destroy = function(req, res) {
  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
        Group.findById(req.params.id, function(err, gotGroup){
          if(err) return console.log(err);

          var today = new Date();
          var deptDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

          gotGroup.deleteStatus = 'Yes';
          gotGroup.groupname = 'deleted '+deptDeleteDate +' '+gotGroup.groupname;
       
          gotGroup.save(function(err){
            if(err) return console.log(err);

            groupagent.update({groupid : gotGroup._id, companyid : clientUser.uniqueid},
              {deleteStatus : 'Yes'}, {multi : true}, function(err){
                if(err) return console.log(err);

                Group.find({companyid : clientUser.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, gotGroupsData){

                  res.send({status: 'success', msg: gotGroupsData});

                })


              })

          })


        })
      })
    }
    else if(gotUser.isAdmin == 'Yes'){

      Group.findById(req.params.id, function(err, gotGroup){
        if(err) return console.log(err);

        var today = new Date();
        var deptDeleteDate = today.getFullYear() + '' + (today.getMonth()+1) + '' + today.getDate() + '' + today.getHours() + '' + today.getMinutes() + '' + today.getSeconds();

        gotGroup.deleteStatus = 'Yes';
        gotGroup.groupname = 'deleted '+deptDeleteDate +' '+gotGroup.groupname;
    
        gotGroup.save(function(err){
          if(err) return console.log(err);

          groupagent.update({groupid : gotGroup._id, companyid : gotUser.uniqueid},
            {deleteStatus : 'Yes'}, {multi : true}, function(err){
              if(err) return console.log(err);

              Group.find({companyid : req.user.uniqueid, deleteStatus : 'No'}).populate('createdby').exec(function (err, gotGroupsData){

                res.send({status: 'success', msg: gotGroupsData});

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




// join public group

exports.join = function(req, res) {
  user.findById(req.user._id, function (err, gotUser) {
    if (err) return console.log(err);

    if(req.user.isOwner == 'Yes'){
      user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      
            Group.findById(req.body.groupid, function(err1, gotGroup){
              if(err1) return console.log(err1)

                  // add agent in a group
                    var newgroupagent = new groupagent({
                      groupid : req.body.groupid,
                      companyid : clientUser.uniqueid,
                      agentid : req.body.agentid,
                    });

                    newgroupagent.save(function(err4){
                      if(err4) return console.log(err4)
                    })

                  res.send({status:'success', msg:'You have joined group successfully'})

                })

              });

    }
    else if(gotUser.isAdmin == 'Yes' || gotUser.isSupervisor == 'Yes'){

     
          Group.findById(req.body.groupid, function(err1, gotGroup){
            if(err1) return console.log(err1)
            var newgroupagent = new groupagent({
                    groupid : req.body.groupid,
                    companyid : req.user.uniqueid,
                    agentid : req.body.agentid,
                  });

                  newgroupagent.save(function(err4){
                    if(err4) return console.log(err4)
                  })

                

                res.send({status:'success', msg:'You have joined group successfully'})

              })

          
      
    }
    else
      res.json(501, {});

  })
};
