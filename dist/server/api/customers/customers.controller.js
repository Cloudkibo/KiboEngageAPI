'use strict';

var _ = require('lodash');
var Customers = require('./customers.model');
var user = require('../user/user.model');
var configuration = require('../configuration/configuration.model');
var logger = require('../../components/logger/logger');

// Get list of Customerss
exports.index = function(req, res) {
  Customers.find({companyid : req.user.uniqueid}, function (err, customers) {
    if(err) { return handleError(res, err); }
    return res.json(200, customers);
  });
};



// Get a single customer
exports.show = function(req, res) {
  Customers.findOne({customerID : req.body.customerid}, function (err, customer) {
    if(err) { return handleError(res, err); }
    if(!customer) { return res.send(404); }
    return res.json(customer);
  });
};


// Creates a new Customers in the DB.
exports.create = function(req, res) {
  logger.serverLog('info', 'Inside Create Customer, req body = '+ JSON.stringify(req.body));
  Customers.create(req.body, function(err, customer) {
    if(err) { return handleError(res, err); }
    return res.json(201, customer);
  });
};

// Updates an existing Customers in the DB.
exports.update = function(req, res) {
  if(req.body.customerID) { delete req.body.customerID; }
  Customers.findOne({customerID : req.params.id}, function (err, customer) {
    if (err) { return handleError(res, err); }
    if(!customer) { return res.send(404); }
    var updated = _.merge(customer, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, customer);
    });
  });
};

exports.statsbycountry = function(req, res){
  if(req.user.isOwner == 'Yes'){
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Customers.aggregate({
          $match :
          {
            companyid : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { country : "$country"},
            count: { $sum: 1 }
          }
        }, function (err, gotData){
          if(err) { return handleError(res, err); }
          return res.json(200, gotData);
        })
    })
  }
  else {
    Customers.aggregate({
        $match :
        {
          companyid : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { country : "$country"},
          count: { $sum: 1 }
        }
      }, function (err, gotData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotData);
      })
  }

};

exports.statsbymobile = function(req, res){
  if(req.user.isOwner == 'Yes'){
    user.findOne({email : req.user.ownerAs}, function(err, clientUser){
      if(clientUser == null) return res.json(200, []);
      Customers.aggregate({
          $match :
          {
            companyid : clientUser.uniqueid
          }
        },
        {
          $group : {
            _id : { isMobileClient : "$isMobileClient"},
            count: { $sum: 1 }
          }
        }, function (err, gotData){
          if(err) { return handleError(res, err); }
          return res.json(200, gotData);
        })
    })
  }
  else {
    Customers.aggregate({
        $match :
        {
          companyid : req.user.uniqueid
        }
      },
      {
        $group : {
          _id : { isMobileClient : "$isMobileClient"},
          count: { $sum: 1 }
        }
      }, function (err, gotData){
        if(err) { return handleError(res, err); }
        return res.json(200, gotData);
      })
  }

};

// Deletes a Customers from the DB.
exports.destroy = function(req, res) {
  Customers.findOne({customerID : req.params.id}, function (err, customer) {
    if(err) { return handleError(res, err); }
    if(!customer) { return res.send(404); }
    customer.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
