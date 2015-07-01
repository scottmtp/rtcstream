'use strict';

var chai = require('chai');
var assert = chai.assert;
var EventEmitter = require('events').EventEmitter;
var RtcStream = require('../');

describe('a working rtc stream', function (done) {
  var channel;

  beforeEach(function(done) {
    channel = new EventEmitter();
    channel.addEventListener = function(msg, func) {
      channel.on(msg, func);
    };

    channel.send = function(chunk) {
      this.emit('send', chunk);
    };

    done();
  });

  it('should receive data on message', function(done) {
    var rtcStream = new RtcStream('teststream', channel);
    var message = 'hello';
    var received = '';

    rtcStream.on('data', function(data) {
      received = received + ab2str(data);
    });

    rtcStream.on('end', function() {
      assert.equal(message, received);
      done();
    });

    channel.emit('message', str2ab(message));
    channel.emit('close');
  });

  it('should send data to channel when written to', function(done) {
    var rtcStream = new RtcStream('teststream', channel);
    var message = 'hello';
    var sent = '';

    channel.on('send', function(chunk) {
      assert.equal(message, ab2str(chunk));
      done();
    });

    rtcStream.write(message);
  });
});

function ab2str(ab) {
  return String.fromCharCode.apply(null, new Uint8Array(ab));
}

function str2ab(str) {
  var len = str.length;
  var ab = new ArrayBuffer(len);
  var view = new Uint8Array(ab);

  for (var i = 0; i < len; i++) {
    view[i] = str.charCodeAt(i);
  }

  return ab;
}
