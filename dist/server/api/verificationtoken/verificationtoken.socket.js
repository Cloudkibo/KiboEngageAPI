/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Verificationtoken = require('./verificationtoken.model');

exports.register = function(socket) {
  Verificationtoken.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Verificationtoken.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('verificationtoken:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('verificationtoken:remove', doc);
}