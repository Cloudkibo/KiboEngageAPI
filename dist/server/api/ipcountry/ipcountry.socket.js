/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Ipcountry = require('./ipcountry.model');

exports.register = function(socket) {
  Ipcountry.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Ipcountry.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('ipcountry:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('ipcountry:remove', doc);
}