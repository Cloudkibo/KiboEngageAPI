'use strict';

var _ = require('lodash');
var fbpages = require('./fbpages.model');
var user = require('../user/user.model');
var configuration = require('../configuration/configuration.model');
var logger = require('../../components/logger/logger');

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

         fbpages.create(req.body, function(err, page) {
                if(err) { return handleError(res, err); }

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




// Updates an existing facebook page info in the DB.
exports.update = function(req, res) {
  if(req.body.pageid) { delete req.body.pageid; }
  fbpages.findOne({pageid : req.params.id}, function (err, page) {
    if (err) { return handleError(res, err); }
    if(!page) { return res.send(404); }
    var updated = _.merge(page, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, page);
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
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
