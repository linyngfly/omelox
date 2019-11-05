"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var application_1 = __importDefault(require("./application"));
var connectorProxyTcp_1 = require("./connector/connectorProxyTcp");
var connectorProxyWs_1 = require("./connector/connectorProxyWs");
var hasCreated = false;
var pomelox = {};
pomelox.version = require("../package.json").version;
pomelox.createApp = function () {
    if (hasCreated) {
        console.error("the app has already been created");
        return;
    }
    hasCreated = true;
    pomelox.app = new application_1.default();
    return pomelox.app;
};
pomelox.connector = {
    "connectorTcp": connectorProxyTcp_1.ConnectorTcp,
    "connectorWs": connectorProxyWs_1.ConnectorWs
};
module.exports = pomelox;
