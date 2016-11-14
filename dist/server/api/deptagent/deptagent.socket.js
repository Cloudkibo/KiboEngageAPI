/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Deptagent = require('./deptagent.model');

exports.register = function(socket) {
  Deptagent.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Deptagent.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('deptagent:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('deptagent:remove', doc);
}