  var Emitter = require('emitter');
  window.EventEmitter = Emitter;

  var protocol = require('omelox-protocol');
  window.Protocol = protocol;
  
  var protobuf = require('omelox-protobuf');
  window.protobuf = protobuf;
  
  var omelox = require('omelox-jsclient-websocket');
  window.omelox = omelox;
