/**
 * Main application file
 */

'use strict';



// change the value to development for localhost and production for production
process.env.NODE_ENV = process.env.NODE_ENV || 'production';//development';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

var fs = require('fs');

var logger = require('./components/logger/logger');

logger.serverLog('info', 'Server started');


// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);


// Setup server
var httpapp = express();
var app = express();


var options = {
  ca: fs.readFileSync('server/security/gd_bundle-g2-g1.crt'),
  key: fs.readFileSync('server/security/server.key'),
  cert: fs.readFileSync('server/security/3b414648bf907e49.crt')
};




var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync('server/sample-yaml/kiboEngage.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
  //app.use(middleware.swaggerMetadata());

  // Validate Swagger requests
  //app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  //app.use(middleware.swaggerRouter(options));

  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());
  httpapp.use(middleware.swaggerUi());




  var server = require('http').createServer(httpapp);
  var httpsServer = require('https').createServer(options, app);



  //httpapp.get('*',function(req,res){
  //  res.redirect('https://api.kibosupport.com'+req.url)
  //});

  require('./config/express')(app);
  require('./routes')(app);

  // Start server
  server.listen(config.port, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });

  httpsServer.listen(config.secure_port, function(){
    console.log('Express server listening on %d, in %s mode', config.secure_port, app.get('env'));
  });

})


// Expose app
exports = module.exports = app;
