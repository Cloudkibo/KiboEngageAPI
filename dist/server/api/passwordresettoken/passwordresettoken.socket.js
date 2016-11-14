/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Passwordresettoken = require('./passwordresettoken.model');

exports.register = function(socket) {
  Passwordresettoken.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Passwordresettoken.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('passwordresettoken:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('passwordresettoken:remove', doc);
}