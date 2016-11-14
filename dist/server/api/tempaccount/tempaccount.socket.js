/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Tempaccount = require('./tempaccount.model');

exports.register = function(socket) {
  Tempaccount.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Tempaccount.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('tempaccount:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('tempaccount:remove', doc);
}