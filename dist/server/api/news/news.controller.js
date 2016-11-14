'use strict';

var _ = require('lodash');
var News = require('./news.model');
var user = require('../user/user.model');
var configuration = require('../configuration/configuration.model');
var logger = require('../../components/logger/logger');

// Get All News
exports.index = function(req, res) {
  News.find({companyid : req.user.uniqueid}, function (err, news) {
    if(err) { return handleError(res, err); }
    return res.json(200, news);
  });
};



// fetch news for a particular targeted agent
exports.show = function(req, res) {
   News.find({target : req.body.target}, function (err, news) {
    if(err) { return handleError(res, err); }
    return res.json(200, news);
  });
};


// Creates a news in the DB.
exports.create = function(req, res) {
  logger.serverLog('info', 'Inside Create News, req body = '+ JSON.stringify(req.body));
  News.create(req.body, function(err, news) {
    if(err) { return handleError(res, err); }
    return res.json(201, news);
  });
};

// Updates news in the DB.
exports.update = function(req, res) {
  News.findOne({_id : req.body.newsid, companyid : req.user.uniqueid}, function(err, gotNews){

    gotNews.unread = req.body.unread;

    gotNews.save(function(err){
      if(err) console.log(err);
      res.json(200, {status : 'success'});
    });
  })
};

// Deletes a news from the DB.
exports.destroy = function(req, res) {
  News.findOne({_id : req.params.id}, function (err, news) {
    if(err) { return handleError(res, err); }
    if(!news) { return res.send(404); }
    news.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
