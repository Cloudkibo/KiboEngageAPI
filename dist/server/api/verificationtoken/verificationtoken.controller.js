'use strict';

var _ = require('lodash');
var Verificationtoken = require('./verificationtoken.model');
var user = require('../user/user.model');
var configuration = require('../configuration/configuration.model');

// Get list of verificationtokens
exports.index = function(req, res) {
  Verificationtoken.find(function (err, verificationtokens) {
    if(err) { return handleError(res, err); }
    return res.json(200, verificationtokens);
  });
};

// Get a single verificationtoken
exports.show = function(req, res) {
  Verificationtoken.findOne({token : req.params.id}, function (err, verificationtoken) {
    if(err) { return handleError(res, err); }
    if(!verificationtoken) { return res.send(404); }

    user.findOne({_id: verificationtoken.user}, function (err, user) {
      if (err) return done(err);
      if (!user) return res.send(404);

      user["accountVerified"] = 'Yes';

      configuration.findOne({}, function(err, gotConfig) {

        var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

        var emailConfirm     = new sendgrid.Email({
          to:       user.email,
          from:     'support@cloudkibo.com',
          subject:  'KiboSupport: Account verified '+ user.website,
          text:     'Welcome to KiboSupport',
          bcc: 'accounts@cloudibo.com'
        });

        if(user.isAdmin === 'Yes') {

          emailConfirm.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
            '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
            '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
            '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
            '<p style="color: #ffffff">Welcome to Kibosupport</p> </td></tr> </table> </td> </tr> </table> ' +
            '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
            '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
            '<tr> <td class="wrapper last"> <p> Hello, <br> '+ user.firstname +' '+ user.lastname +'<br> Thank you for signing up with Kibosupport, your account has been verified. Following is you account information:'+
            '<p> <ul> <li>Name: '+user.firstname + ' ' + user.lastname +'</li> ' +
            '<li>Company Domain: '+ user.website+' </li><li>Company Name: '+ user.companyName+' </li>'+
            ' <li>Email Address: '+user.email +'</li><li>Phone: '+user.phone +' </li></ul> </p> ,br><p> Here are few instruction that might help you to get start with Kibosupport.</p>'+
            ' <h3> <center><class="block"><b>Important instruction</b></center><br><!-- BEGIN: Note Panel --> <table class="twelve columns" style="margin-bottom: 10px"> ' +
            '<tr> <td class="panel" style="background: #ECF8FF;border: 0;padding: 10px !important;"> To embed the widget on your website, you need to put this line before &lt;/head&gt; tag or '+
            'before &lt;/body&gt; tag of HTML of your website each page.<br/><br/>'+
            '<center><code class="codeBox">&lt;script src="https://api.kibosupport.com/javascripts/widget/widget.js"&gt; &lt;/script&gt;</code></center><br/>Then you must have to put a button on your page with our onclick function. Example of button is given below.<br/><br/>'+
            '<center><code class="codeBox">&lt;button onclick="loadKiboWidget(' + user.uniqueid + ')"&gt; Live Help &lt;/button&gt;</code></center><br/>Note: You can use any css desgin for the button. You can also use &lt;a&gt; tag if you do not want button.'+
            'Just remember to do the function call as shown above.<br/>The <b>onclick="loadKiboWidget(' + user.uniqueid + ')" </b> contains your unique client id. Never alter this function and its value.<br/></h4> </td> <td class="expander"> </td> </tr> </table>' +
            '<p> If clicking the URL above does not work, copy and paste the URL into a browser window. </p> <!-- END: Note Panel --> </td> </tr> </table><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table>'+
            '<!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This is a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
            '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')
/*
          emailConfirm.setHtml('<h1>Kibosupport</h1><br><br>Welcome to Kibosupport ' + user.firstname + ' ' + user.lastname +
          '<br>' +
          '<br><h4></h4> Thank you for signing up with Kibosupport, your account has been verified. Following is your account information ' +
          '<br>' +
          '<br> Name:   ' + user.firstname + ' ' + user.lastname +
          '<br> Domain:   ' + user.website +
          '<br> Company:   ' + user.companyName +
          '<br> Email Address:   ' + user.email +
          '<br> Phone:   ' + user.phone +
          '<br>' +
          '<br> Here are a few important instruction for getting started with Kibosupport that might help you out.' +
          '<br><h3> <center><class="block"><b>Important Instructions</center>' +
          '<br>' +
          '<br> To embed the widget on your website, you need to put this line before &lt;/head&gt; tag or ' +
          'before &lt;/body&gt; tag of HTML of your website each page.<br/><br/>' +
          '<center><code class="codeBox">&lt;script src="https://api.kibosupport.com/javascripts/widget/widget.js"&gt; &lt;/script&gt;</code></center><br/>Then you must have to put a button on your page with our onclick function. Example of button is given below.<br/><br/>' +
          '<center><code class="codeBox">&lt;button onclick="loadKiboWidget(' + user.uniqueid + ')"&gt; Live Help &lt;/button&gt;</code></center><br/><b>Note:</b><br/> You can use any css design for the button. You can also use &lt;a&gt; tag if you do not want button.' +
          ' Just remember to do the function call as shown above.<br/>The <b>onclick="loadKiboWidget(' + user.uniqueid + ')" </b>contains your unique client id. Never alter this function and its value.<br/>' +
          '<br><br><small>If this email was not intended for you, you can simply ignore it.</small>');
*/
        } else {

          emailConfirm.setHtml('<h1>Kibosupport</h1><br><br>Welcome to Kibosupport ' + user.firstname + ' ' + user.lastname +
          '<br>' +
          '<br><h4></h4> Your account has been verified thank you for joining us. Following is your account information ' +
          '<br>' +
          '<br> Name:   ' + user.firstname + ' ' + user.lastname +
          '<br> Domain:   ' + user.website +
          '<br> Company:   ' + user.companyName +
          '<br> Email Address:   ' + user.email +
          '<br> Phone:   ' + user.phone +
          '<br>' +
          '</b><br><br>');


          emailConfirm.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
          '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
          '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
          '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
          '<p style="color: #ffffff">Welcome to Kibosupport</p> </td></tr> </table> </td> </tr> </table> ' +
          '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
          '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
          '<tr> <td class="wrapper last"> <p> Hello <br> '+ user.firstname +' '+ user.lastname +',<br> Thank you for joining us, your account has been verified. Following is your account information:'+
          '<p> <ul> <li>Name: '+user.firstname + ' ' + user.lastname +'</li> ' +
          '<li>Company Domain: '+ user.website+' </li><li>Company Name: '+ user.companyName+' </li>'+
          ' <li>Email Address: '+user.email +'</li><li>Phone: '+user.phone +' </li></ul> </p> '+
          '<br><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table>'+
          '<!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This is a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
          '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')

        }

        sendgrid.send(emailConfirm, function(err, json) {
          if (err) { return console.log(err); }
          console.log(json);
        });

        user.save(function(err) {
          res.json({status : 'success'});
        });

      });


    })

  });
};


/******* KiboEngage ***/

// Get a single verificationtoken
exports.showKiboEngage = function(req, res) {
  Verificationtoken.findOne({token : req.params.id}, function (err, verificationtoken) {
    if(err) { return handleError(res, err); }
    if(!verificationtoken) { return res.send(404); }

    user.findOne({_id: verificationtoken.user}, function (err, user) {
      if (err) return done(err);
      if (!user) return res.send(404);

      user["accountVerified"] = 'Yes';

      configuration.findOne({}, function(err, gotConfig) {

        var sendgrid = require('sendgrid')(gotConfig.sendgridusername, gotConfig.sendgridpassword);

        var emailConfirm     = new sendgrid.Email({
          to:       user.email,
          from:     'support@cloudkibo.com',
          subject:  'KiboEngage: Account verified '+ user.website,
          text:     'Welcome to KiboEngage',
          bcc: 'accounts@cloudibo.com'
        });

        if(user.isAdmin === 'Yes') {

          emailConfirm.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
            '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
            '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
            '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
            '<p style="color: #ffffff">Welcome to KiboEngage</p> </td></tr> </table> </td> </tr> </table> ' +
            '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
            '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
            '<tr> <td class="wrapper last"> <p> Hello, <br> '+ user.firstname +' '+ user.lastname +'<br> Thank you for signing up with KiboEngage, your account has been verified. Following is you account information:'+
            '<p> <ul> <li>Name: '+user.firstname + ' ' + user.lastname +'</li> ' +
            '<li>Company Domain: '+ user.website+' </li><li>Company Name: '+ user.companyName+' </li>'+
            ' <li>Email Address: '+user.email +'</li><li>Phone: '+user.phone +' </li></ul> </p>'+
            '<!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This is a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
            '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')
        } else {

          emailConfirm.setHtml('<h1>KiboEngage</h1><br><br>Welcome to KiboEngage ' + user.firstname + ' ' + user.lastname +
          '<br>' +
          '<br><h4></h4> Your account has been verified thank you for joining us. Following is your account information ' +
          '<br>' +
          '<br> Name:   ' + user.firstname + ' ' + user.lastname +
          '<br> Domain:   ' + user.website +
          '<br> Company:   ' + user.companyName +
          '<br> Email Address:   ' + user.email +
          '<br> Phone:   ' + user.phone +
          '<br>' +
          '</b><br><br>');


          emailConfirm.setHtml('<body style="min-width: 80%;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;margin: 0;padding: 0;direction: ltr;background: #f6f8f1;width: 80% !important;"><table class="body", style="width:100%"> ' +
          '<tr> <td class="center" align="center" valign="top"> <!-- BEGIN: Header --> <table class="page-header" align="center" style="width: 100%;background: #1f1f1f;"> <tr> <td class="center" align="center"> ' +
          '<!-- BEGIN: Header Container --> <table class="container" align="center"> <tr> <td> <table class="row "> <tr>  </tr> </table> <!-- END: Logo --> </td> <td class="wrapper vertical-middle last" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;"> <!-- BEGIN: Social Icons --> <table class="six columns"> ' +
          '<tr> <td> <table class="wrapper social-icons" align="right" style="float: right;"> <tr> <td class="vertical-middle" style="padding-top: 0;padding-bottom: 0;vertical-align: middle;padding: 0 2px !important;width: auto !important;"> ' +
          '<p style="color: #ffffff">Welcome to KiboEngage</p> </td></tr> </table> </td> </tr> </table> ' +
          '<!-- END: Social Icons --> </td> </tr> </table> </td> </tr> </table> ' +
          '<!-- END: Header Container --> </td> </tr> </table> <!-- END: Header --> <!-- BEGIN: Content --> <table class="container content" align="center"> <tr> <td> <table class="row note"> ' +
          '<tr> <td class="wrapper last"> <p> Hello <br> '+ user.firstname +' '+ user.lastname +',<br> Thank you for joining us, your account has been verified. Following is your account information:'+
          '<p> <ul> <li>Name: '+user.firstname + ' ' + user.lastname +'</li> ' +
          '<li>Company Domain: '+ user.website+' </li><li>Company Name: '+ user.companyName+' </li>'+
          ' <li>Email Address: '+user.email +'</li><li>Phone: '+user.phone +' </li></ul> </p> '+
          '<br><span class="devider" style="border-bottom: 1px solid #eee;margin: 15px -15px;display: block;"></span> <!-- END: Disscount Content --> </td> </tr> </table> </td> </tr> </table>'+
          '<!-- END: Content --> <!-- BEGIN: Footer --> <table class="page-footer" align="center" style="width: 100%;background: #2f2f2f;"> <tr> <td class="center" align="center" style="vertical-align: middle;color: #fff;"> <table class="container" align="center"> <tr> <td style="vertical-align: middle;color: #fff;"> <!-- BEGIN: Unsubscribet --> <table class="row"> <tr> <td class="wrapper last" style="vertical-align: middle;color: #fff;"><span style="font-size:12px;"><i>This is a system generated email and reply is not required.</i></span> </td> </tr> </table> <!-- END: Unsubscribe --> ' +
          '<!-- END: Footer Panel List --> </td> </tr> </table> </td> </tr> </table> <!-- END: Footer --> </td> </tr></table></body>')

        }

        sendgrid.send(emailConfirm, function(err, json) {
          if (err) { return console.log(err); }
          console.log(json);
        });

        user.save(function(err) {
          res.json({status : 'success', body: user});
        });

      });


    })

  });
};


// Creates a new verificationtoken in the DB.
exports.create = function(req, res) {
  Verificationtoken.create(req.body, function(err, verificationtoken) {
    if(err) { return handleError(res, err); }
    return res.json(201, verificationtoken);
  });
};

// Updates an existing verificationtoken in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Verificationtoken.findById(req.params.id, function (err, verificationtoken) {
    if (err) { return handleError(res, err); }
    if(!verificationtoken) { return res.send(404); }
    var updated = _.merge(verificationtoken, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, verificationtoken);
    });
  });
};

// Deletes a verificationtoken from the DB.
exports.destroy = function(req, res) {
  Verificationtoken.findById(req.params.id, function (err, verificationtoken) {
    if(err) { return handleError(res, err); }
    if(!verificationtoken) { return res.send(404); }
    verificationtoken.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
