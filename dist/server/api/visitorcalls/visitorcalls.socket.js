/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Visitorcalls = require('./visitorcalls.model');

exports.register = function(socket) {
  Visitorcalls.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Visitorcalls.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
};

function onSave(socket, doc, cb) {
  socket.broadcast.to(doc.room).emit('visitorcalls:save', doc);
  //socket.emit('visitorcalls:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('visitorcalls:remove', doc);
}
