'use strict';

var filetransfers = require('./filetransfers.model');
var User = require('../user/user.model');
var Userchat = require('../userchat/userchat.model');

var logger = require('../../components/logger/logger');
var crypto = require('crypto');

exports.upload = function(req, res) {
	
      console.log(req.body);
	  var fileData = new filetransfers({
		   to : req.body.to,
	       from : req.body.from,
	       uniqueid: req.body.uniqueid,
	       file_name : req.body.filename,
	       file_size : req.body.filesize,
	       date : req.body.date,
	       path : req.body.path,
	       file_type : req.body.filetype,
	       status : 'sent',
	       request_id : req.body.request_id,
			 })

	  fileData.save(function(err,filedata){
				 if(err) return res.send({error: 'Database Error'});
				 // create a entry in Userchat table also
				  var obj = JSON.parse(req.body.chatmsg);
				 console.log(obj.to);
				 console.log(filedata);
				  Userchat.create(obj, function(err, userchat) {
				    if(err) { return handleError(res, err); }
				    return res.json(201,{chatmsg :userchat,filedata : filedata} );
				  });

			 });

 };

exports.download = function(req, res, next) {
console.log('this is id when downloading file');
console.log(req.body.uniqueid);
	filetransfers.findOne({uniqueid : req.body.uniqueid}, function(err, data){
		if(err) return res.send({status : 'database error'});
		res.json(200, data);
	});
};

// incremental file sync with message status 'sent'
exports.partialFileSync = function(req, res) {
  console.log('partial sync is called ');
  console.log(req.body);
  filetransfers.find({companyid: req.body.companyid,to : req.body.customerid,status : 'sent'}, function (err, files) {
    if(err) { return handleError(res, err); }
    return res.json(200, files);
  });
};


// Updates an existing filetransfer in the DB.
exports.updateStatus = function(req, res) {
  console.log('update status api is called');
  console.log(req.body);
  if(req.body.filesobj)
  {
   for(var i=0;i<req.body.filesobj.length;i++)
      {
               var obj = req.body.filesobj[i]
               console.log(obj.uniqueid);
               filetransfers.update({'uniqueid':obj.uniqueid},{$set:{'status':obj.status}},
                function(err, result) {
                if(err){
                  res.send(404);
                }
        });

      }
    res.send({status : 'statusUpdated'});
  }
  else{
    res.send({status : 'statusUpdateFailed,data not in correct format'});
  }

};
