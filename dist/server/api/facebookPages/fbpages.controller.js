'use strict';

var _ = require('lodash');
var fbpages = require('./fbpages.model');
var user = require('../user/user.model');
var configuration = require('../configuration/configuration.model');
var logger = require('../../components/logger/logger');
var FbPageteam = require('../fbpageTeam/fbpageteam.model');
var groupagent = require('../groupagent/groupagent.model');

// Get list of facebook pages
exports.index = function(req, res) {
  logger.serverLog('info', 'Fetch fbpages');

  fbpages.find({companyid : req.user.uniqueid}, function (err, pages) {
    if(err) { return handleError(res, err); }
    return res.json(200, pages);
  });
};


// Creates a new fb pages in the DB.
exports.create = function(req, res) {
  logger.serverLog('info', 'Inside Create facebook page info, req body = '+ JSON.stringify(req.body));
  console.log('create fbpage info');


  fbpages.count({pageid : req.body.pageid, companyid : req.user.uniqueid}, function(err, gotCount){

        if(gotCount > 0)
          res.send({status: 'danger', msg: 'Facebook page Info Already exists'});
        else{

         fbpages.create(req.body.fbpage, function(err, page) {
                if(err) { return handleError(res, err); }


                //create fbpages teams

                // create dept agents
                  if(req.body.teamagents){
                    logger.serverLog('info', 'Inside teamagents '+ JSON.stringify(req.body.teamagents) );

                    for(var team in req.body.teamagents){
                      logger.serverLog('info', 'Inside teamagents '+ JSON.stringify(team) );

                    var newteamagent = new FbPageteam({
                      pageid : page._id,
                      companyid : req.user.uniqueid,
                      teamid : req.body.teamagents[team]._id
                    });

                      newteamagent.save(function(err4){
                        if(err4) return console.log(err4)
                      })

                    }
                  }

                return  res.send({status: 'success', msg: page});
              });

        }
      })

};

// Get a companyid from pageid
exports.show = function(req, res) {
  fbpages.findOne({pageid : req.body.pageid}, function (err, page) {
    if(err) { return handleError(res, err); }
    if(!page) { return res.send(404); }
    return res.json(page);
  });
};


// Endpoint to get fbpage, fbpageTeams and Team Agents in single API call
exports.showfbpage = function(req, res) {
  fbpages.findOne({pageid : req.body.pageid}, function (err, page) {
    if(err) { return handleError(res, err); }
    if(!page) { return res.send(404); }

    //get fbpageTeams
    FbPageteam.find({companyid : page.companyid,deleteStatus : 'No'}).populate('pageid teamid').exec(function (err, fbpageteams) {
    if(err) { return handleError(res, err); }

    //get team agents
     groupagent.find({companyid : page.companyid,deleteStatus : 'No'}).populate('groupid agentid').exec(function (err, teamagents) {
          if(err) { return handleError(res, err); }
          return res.json(200, {teamagents:teamagents,fbpageteams:fbpageteams,page:page});
           });
  });

  });
};



// Updates an existing facebook page info in the DB.
exports.update = function(req, res) {
  logger.serverLog('info', 'Inside Edit fbpage '+ JSON.stringify(req.body) );

  if(req.body.fbpage.pageid) { delete req.body.fbpage.pageid; }
  fbpages.findOne({pageid : req.params.id}, function (err, page) {
    if (err) { return handleError(res, err); }
    if(!page) { return res.send(404); }
    var updated = _.merge(page, req.body.fbpage);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }


                FbPageteam.remove({pageid : req.body.fbpage._id}, function(err3){
                  if(err3) return console.log(err3)
                  if(req.body.teamagents)
                  {
                      for(var team in req.body.teamagents){

                        var newteamagent = new FbPageteam({
                          pageid : req.body.fbpage._id,
                          companyid : req.body.fbpage.companyid,
                          teamid : req.body.teamagents[team]._id
                        });

                        newteamagent.save(function(err4){
                          if(err4) return console.log(err4)
                        })

                      }
                }
                  return res.json(200, page);
                });

    });
  });
};

// Deletes a facebook page from the DB.
exports.destroy = function(req, res) {
  fbpages.findOne({pageid : req.params.id}, function (err, fbpage) {
    if(err) { return handleError(res, err); }
    if(!fbpage) { return res.send(404); }
    fbpage.remove(function(err) {
      if(err) { return handleError(res, err); }

        FbPageteam.update({pageid : fbpage._id, companyid : fbpage.companyid},
            {deleteStatus : 'Yes'}, {multi : true}, function(err){
              if(err) return console.log(err);
               return res.send(204);
             });
    });
  });
};

exports.deletefbpages = function(req, res) {
  res.send(204);
  req.body.ids.forEach(function(itemId){
    fbpages.findOne({pageid : itemId}, function (err, fbpage) {
      if(err) { return handleError(res, err); }
      if(!fbpage) { return res.send(404); }
      fbpage.remove(function(err) {
        if(err) { return handleError(res, err); }

          FbPageteam.update({pageid : fbpage._id, companyid : fbpage.companyid},
              {deleteStatus : 'Yes'}, {multi : true}, function(err){
                if(err) return console.log(err);

               });
      });
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
