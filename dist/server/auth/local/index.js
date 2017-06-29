'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
var User = require('./../../api/user/user.model.js');

var router = express.Router();

router.post('/', function(req, res, next) {
  User.findOne({website: req.body.website.toLowerCase(), email: req.body.email.toLowerCase()}, function (err, user) {
    if (err) return res.json(501, 'Internal server error. Please inform admin.');
    if (!user) return res.json(404, {message: 'This domain is not registered with us or your account does not belong to this domain'});

    passport.authenticate('local', function (err, user, info) {
      var error = err || info;
      if (error) return res.json(401, error);
      if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});

      var token = auth.signToken(user._id, user.role);
      res.json({token: token});
    })(req, res, next)

  });
});

module.exports = router;
