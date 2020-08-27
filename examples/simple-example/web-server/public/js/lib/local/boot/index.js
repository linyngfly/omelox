  var Emitter = require('emitter');
  window.EventEmitter = Emitter;

  var protocol = require('omelox-protocol');
  window.Protocol = protocol;
  
  var protobuf = require('omelox-protobuf');
  window.protobuf = protobuf;
  
  var pinus = require('pinus-jsclient-websocket');
  window.pinus = pinus;
