var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { message: 'This email is not registered.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'This password is not correct.' });
        }
        return done(null, user);
      });
    }
  ));
};

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
