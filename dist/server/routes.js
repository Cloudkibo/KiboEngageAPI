/**
 * Main application routes
 */

'use strict';
var errors = require('./components/errors');
var ipcountry = require('./api/ipcountry/ipcountry.model');
var departments = require('./api/department/department.model');
var accounts = require('./api/user/user.model');
var visitorcalls = require('./api/visitorcalls/visitorcalls.model');
var agentinitiatedcalls = require('./api/agentinitiatedcalls/agentinitiatedcalls.model');
var companyprofile = require('./api/companyprofile/companyprofile.model');

var fs = require('fs');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/shortcuts', require('./api/shortcut'));
  app.use('/api/inviteagenttokens', require('./api/inviteagenttoken'));
  app.use('/api/passwordresettokens', require('./api/passwordresettoken'));
  app.use('/api/verificationtokens', require('./api/verificationtoken'));
  app.use('/api/tempaccounts', require('./api/tempaccount'));
  app.use('/api/ipcountry', require('./api/ipcountry'));
  app.use('/api/deptagents', require('./api/deptagent'));
  app.use('/api/deptteams', require('./api/deptteam'));
  app.use('/api/fbpageteams', require('./api/fbpageTeam'));
  app.use('/api/groupagents', require('./api/groupagent'));
  app.use('/api/departments', require('./api/department'));
  app.use('/api/messagechannels', require('./api/messagechannels'));
  app.use('/api/agentinitiatedcall', require('./api/agentinitiatedcalls'));
  app.use('/api/visitorcalls', require('./api/visitorcalls'));
  app.use('/api/configurations', require('./api/configuration'));
  app.use('/api/userchats', require('./api/userchat'));
  app.use('/api/companyprofiles', require('./api/companyprofile'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/customers', require('./api/customers'));
  app.use('/api/groups', require('./api/group'));
  app.use('/api/filetransfers', require('./api/filetransfers'));

  app.use('/api/agentassignments', require('./api/agentassignment'));
  app.use('/api/channelassignments', require('./api/channelassignment'));
  app.use('/api/notifications', require('./api/notifications'));
  app.use('/api/news', require('./api/news'));

  app.use('/api/readstatus', require('./api/readstatus'))

  app.use('/auth', require('./auth'));


// adding routes of Facebook messenger related APIs
  app.use('/api/fbmessages', require('./api/fbmessages'));
  app.use('/api/fbsessions', require('./api/facebookSessions'));
  app.use('/api/fbagentassignments', require('./api/fbagentassignment'));
  app.use('/api/fbCustomers', require('./api/facebookCustomers'));
  app.use('/api/fbpages', require('./api/facebookPages'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  app.route('/ping')
  .get(function(req, res){
     res.send('ping response sent at '+ Date.now());
  })
  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      //res.redirect('/docs');
      res.send('KiboEngage API is up and running.');
    });
};
