import Application from "./application";
import { I_connectorConstructor } from "./util/interfaceDefine";
import { ConnectorTcp } from "./connector/connectorProxyTcp";
import { ConnectorWs } from "./connector/connectorProxyWs";

interface I_omelox {
    version: string,
    createApp: () => Application | undefined,
    app: Application,
    connector: {
        connectorTcp: I_connectorConstructor,
        connectorWs: I_connectorConstructor,
    }
}


let hasCreated = false;
let omelox: I_omelox = {} as any;
omelox.version = require("../package.json").version;
omelox.createApp = function () {
    if (hasCreated) {
        console.error("the app has already been created");
        return;
    }
    hasCreated = true;
    omelox.app = new Application();
    return omelox.app;
};

omelox.connector = {
    "connectorTcp": ConnectorTcp,
    "connectorWs": ConnectorWs
};


export = omelox