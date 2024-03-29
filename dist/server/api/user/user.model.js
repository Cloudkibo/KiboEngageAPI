'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var UserSchema = new Schema({
  firstname : String,
  lastname : String,
  email : { type : String , lowercase : true},
  phone : String,

  country : String,
  city : String,
  state : String,

  isAgent : String,
  isAdmin : String,
  isOwner : {type: String, default: 'No' },
  isSupervisor : String,

  website :  { type: String, lowercase: true },
  companyName : String,
  uniqueid : String,

  picture: String,
  accountVerified : {type: String, default: 'No' },
  date  :  { type: Date, default: Date.now },
  isDeleted : {type: String, default: 'No'},

  canIncludeAgent : {type: String, default: 'No'},
  canExcludeAgent : {type: String, default: 'No'},

  abandonedemail1 : String,
  abandonedemail2 : String,
  abandonedemail3 : String,

  completedemail1 : String,
  completedemail2 : String,
  completedemail3 : String,

  invitedemail1 : String,
  invitedemail2 : String,
  invitedemail3 : String,

  allownotification : {type: String, default: 'No'},
  allowchime: {type: String, default: 'No'},

  role: {
    type: String,
    default: 'admin'
  },

  ownerAs : String,

  hashedPassword: String,
  provider: String,
  salt: String
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    return email.length;
  }, 'Email cannot be blank');

// Validate empty phone
UserSchema
  .path('phone')
  .validate(function(phone) {
    return phone.length;
  }, 'Phone cannot be blank');


// Validate empty website
UserSchema
  .path('website')
  .validate(function(website) {
    return website.length;
  }, 'Domain name cannot be blank');

// Validate empty company name
UserSchema
  .path('companyName')
  .validate(function(companyName) {
    return companyName.length;
  }, 'Company name cannot be blank');


// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    console.log(this.companyName);
    console.log('companyName');
    this.constructor.findOne({email: value,companyName:this.companyName}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

// Validate phone is not taken
UserSchema
  .path('phone')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({phone: value,companyName:this.companyName}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified phone number is already in use.');

// todo discuss about this: Commenting so that agent can join
/*
// Validate website is not taken
UserSchema
  .path('website')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({website: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified domain name is already in use.');

// Validate company name is not taken
UserSchema
  .path('companyName')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({companyName: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified company name is already in use.');
*/

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword))
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('Account', UserSchema);
