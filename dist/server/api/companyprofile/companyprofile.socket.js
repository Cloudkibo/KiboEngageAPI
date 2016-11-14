/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Companyprofile = require('./companyprofile.model');

exports.register = function(socket) {
  Companyprofile.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Companyprofile.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('companyprofile:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('companyprofile:remove', doc);
}