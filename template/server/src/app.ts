
import { createApp, Application, Session, connector } from "omelox";
import roomMgr from "./app/roomMgr";
let app = createApp();

app.configure("connector", function () {
    app.route("chat", function (app: Application, session: Session, serverType: string, cb: Function) {
        cb(session.get("chatServerId"));
    });
});

app.setConnectorConfig({ "connector": connector.connectorWs })
app.setEncodeDecodeConfig({ "msgDecode": msgDecode })

app.configure("chat", function () {
    app.set("roomMgr", new roomMgr(app));
});


app.onLog(function (level: string, info: string) {
    console.log(app.serverId, level, info)
})

app.start();

process.on("uncaughtException", function (err: any) {
    console.log(err)
});


function msgDecode(cmdId: number, msgBuf: Buffer) {
    console.log(app.routeConfig[cmdId]);
    return JSON.parse(msgBuf.toString());
}