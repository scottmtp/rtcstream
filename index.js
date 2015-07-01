'use strict';
var stream = require('stream');
var toBuffer = require('typedarray-to-buffer');
var util = require('util');
var debug = require('debug')('rtcstream')

function RtcStream(id, channel) {
  if (!(this instanceof RtcStream)) {
    return new RtcStream(id, channel);
  }

  stream.Duplex.call(this);
  this.id = id;
  this.channel = channel;
  this.channel.binaryType = 'arraybuffer';

  this.channel.addEventListener('message', this.handleRtcMessage.bind(this));
  this.channel.addEventListener('close', this.handleRtcClose.bind(this));
  this.channel.addEventListener('open', this.handleRtcOpen.bind(this));
  this.channel.addEventListener('error', this.handleRtcError.bind(this));
}

module.exports = RtcStream;
util.inherits(RtcStream, stream.Duplex);

// stream implementation
RtcStream.prototype._read = function() {
  // noop, we just push data in handleRtcMessage
}

RtcStream.prototype._write = function(chunk, encoding, next) {
  try {
    if (Buffer.isBuffer(chunk)) {
      this.channel.send(new Uint8Array(chunk).buffer);
    } else {
      this.channel.send(chunk);
    }

  } finally {
    next();
  }
}

// data channel events
RtcStream.prototype.handleRtcMessage = function(event) {
  var data = event.data ? event.data : event;

  this.push(toBuffer(data));
  this.emit('readable');
};

RtcStream.prototype.handleRtcClose = function(event) {
  this.push(null); // push null to close the read stream
};

RtcStream.prototype.handleRtcOpen = function(event) {
  debug('open event: %s', this.id);
};

RtcStream.prototype.handleRtcError = function(err) {
  debug('error event: %s %s', this.id, err);
};
