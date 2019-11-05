import Application from "./application";
import { I_connectorConstructor } from "./util/interfaceDefine";
import { ConnectorTcp } from "./connector/connectorProxyTcp";
import { ConnectorWs } from "./connector/connectorProxyWs";

interface I_pomelox {
    version: string,
    createApp: () => Application | undefined,
    app: Application,
    connector: {
        connectorTcp: I_connectorConstructor,
        connectorWs: I_connectorConstructor,
    }
}


let hasCreated = false;
let pomelox: I_pomelox = {} as any;
pomelox.version = require("../package.json").version;
pomelox.createApp = function () {
    if (hasCreated) {
        console.error("the app has already been created");
        return;
    }
    hasCreated = true;
    pomelox.app = new Application();
    return pomelox.app;
};

pomelox.connector = {
    "connectorTcp": ConnectorTcp,
    "connectorWs": ConnectorWs
};


export = pomelox