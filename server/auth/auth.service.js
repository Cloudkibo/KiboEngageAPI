'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var validateJwt = expressJwt({ secret: config.secrets.session });

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      if(req.headers.hasOwnProperty('kibo-app-id')){
        if(req.headers['kibo-app-id'] === '5wdqvvi8jyvfhxrxmu73dxun9za8x5u6n59'){
          console.log('app id is known');
          if(req.headers['kibo-app-secret'] === 'jcmhec567tllydwhhy2z692l79j8bkxmaa98do1bjer16cdu5h79xvx'){
            console.log('client secret is correct')

            User.findOne({uniqueid: req.headers['kibo-client-id'], isAdmin: 'Yes'}, function(err, user){
              if(err) return next(err);
              if(user) {
                req.user = user;
                next();
              } else {
                console.log('client app is not authorized');
                return res.send(401);
              }
            })

          }
        }
      } else {
        // allow access_token to be passed through query parameter as well
        if(req.query && req.query.hasOwnProperty('access_token')) {
          req.headers.authorization = 'Bearer ' + req.query.access_token;
        }
        validateJwt(req, res, next);
      }
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.findById(req.user._id, function (err, user) {
        if (err) return next(err);
        if (!user) return res.send(401);

        req.user = user;
        next();
      });
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      }
      else {
        res.send(403);
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*24*3 });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) return res.json(404, { message: 'Something went wrong, please try again.'});
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

function isAuthorizedWebHookTrigger(){
  return compose()
    .use(function(req, res, next){
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
      console.log(req.ip);
      console.log(ip);
      console.log('This is middleware');
      console.log(req.body)
      if(ip === '162.243.215.177')
        next();
      else
        res.send(403);
    });
}

exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
exports.isAuthorizedWebHookTrigger = isAuthorizedWebHookTrigger;
