/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Agentinitiatedcalls = require('./agentinitiatedcalls.model');

exports.register = function(socket) {
  Agentinitiatedcalls.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Agentinitiatedcalls.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('agentinitiatedcalls:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('agentinitiatedcalls:remove', doc);
}