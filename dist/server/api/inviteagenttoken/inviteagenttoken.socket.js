/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Inviteagenttoken = require('./inviteagenttoken.model');

exports.register = function(socket) {
  Inviteagenttoken.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Inviteagenttoken.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('inviteagenttoken:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('inviteagenttoken:remove', doc);
}