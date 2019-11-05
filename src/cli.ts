#!/usr/bin/env node

import * as path from "path";
import * as fs from "fs";
import { spawn } from "child_process";
import * as define from "./util/define";
import * as msgCoder from "./components/msgCoder";
import program = require("commander");
import { TcpClient } from "./components/tcpClient";

let version = require('../package.json').version;


let DEFAULT_MASTER_HOST = '127.0.0.1';
let DEFAULT_MASTER_PORT = 3005;

let FILEREAD_ERROR = 'Fail to read the file, please check if the application is started legally.';



class clientProxy {
    reqId: number = 1;
    reqs: { [reqId: number]: { "cb": Function, "timeOut": NodeJS.Timer } } = {};
    socket: TcpClient;
    token: string;
    connect_cb: Function;
    constructor(host: string, port: number, token: string, cb: Function) {
        this.token = token;
        this.connect_cb = cb;
        this.socket = new TcpClient(port, host, define.some_config.SocketBufferMaxLen, this.connectCb.bind(this));

        this.socket.on("data", (buf: Buffer) => {
            let data = JSON.parse(buf.toString());
            var reqId = data.reqId;
            var req = this.reqs[reqId];
            if (!req) {
                return;
            }
            delete this.reqs[reqId];
            clearTimeout(req.timeOut);
            req.cb(null, data.msg);
        });

        this.socket.on("close", (err: any) => {
            abort(err);
        });
    }

    private connectCb() {
        // 注册
        var loginInfo = {
            T: define.Cli_To_Master.register,
            cliToken: this.token
        };
        let loginInfo_buf = msgCoder.encodeInnerData(loginInfo);
        this.socket.send(loginInfo_buf);
        this.heartbeat();
        this.connect_cb(this);
    }

    private heartbeat() {
        let self = this;
        setTimeout(function () {
            var heartBeatMsg = { T: define.Cli_To_Master.heartbeat };
            let heartBeatMsg_buf = msgCoder.encodeInnerData(heartBeatMsg);
            self.socket.send(heartBeatMsg_buf);
            self.heartbeat();
        }, define.some_config.Time.Monitor_Heart_Beat_Time * 1000)
    }

    request(msg: any, cb: (err: string, ...args: any[]) => void) {
        let reqId = this.reqId++;
        let data = { "T": define.Cli_To_Master.cliMsg, "reqId": reqId, "msg": msg };
        let buf = msgCoder.encodeInnerData(data);
        this.socket.send(buf);

        let self = this;
        this.reqs[reqId] = {
            "cb": cb,
            "timeOut": setTimeout(function () {
                delete self.reqs[reqId];
                cb("time out");
            }, 10 * 1000)
        };

    }

    close() {
        abort();
    }
}


program.version(version);

program.command('init')
    .description('create a new application')
    .action(function () {
        init();
    });

program.command('start')
    .description('start the application')
    .option('-p, --pro', 'enable production environment')
    .action(function (opts) {
        start(opts);
    });

program.command('list')
    .description('list the servers')
    .option('-h, --host <master-host>', 'master server host', DEFAULT_MASTER_HOST)
    .option('-p, --port <master-port>', 'master server port', DEFAULT_MASTER_PORT)
    .option('-t, --token <cli-token>', 'cli token', define.some_config.Cli_Token)
    .action(function (opts) {
        list(opts);
    });

program.command('stop')
    .description('stop the servers')
    .option('-h, --host <master-host>', 'master server host', DEFAULT_MASTER_HOST)
    .option('-p, --port <master-port>', 'master server port', DEFAULT_MASTER_PORT)
    .option('-t, --token <cli-token>', 'cli token', define.some_config.Cli_Token)
    .action(function (opts) {
        stop(opts);
    });


program.command('remove')
    .description('remove some servers')
    .option('-h, --host <master-host>', 'master server host', DEFAULT_MASTER_HOST)
    .option('-p, --port <master-port>', 'master server port', DEFAULT_MASTER_PORT)
    .option('-t, --token <cli-token>', ' cli token', define.some_config.Cli_Token)
    .action(function (opts) {
        let args = [].slice.call(arguments, 0);
        opts = args[args.length - 1];
        opts.serverIds = args.slice(0, -1);
        remove(opts);
    });


program.command('*')
    .action(function () {
        console.log('Illegal command format. Use `pomelox --help` to get more info.\n');
    });

program.parse(process.argv);


function init() {
    let path = process.cwd();
    emptyDirectory(path, function (empty) {
        if (empty) {
            process.stdin.destroy();
            createApplicationAt(path);
        } else {
            confirm('Destination is not empty, continue? (y/n) [no] ', function (force) {
                process.stdin.destroy();
                if (force) {
                    createApplicationAt(path);
                } else {
                    abort('Fail to init a project');
                }
            });
        }
    });
}


function createApplicationAt(ph: string) {
    copy(path.join(__dirname, '../template/server'), ph);
    copy(path.join(__dirname, '../template/client'), ph);
}


function emptyDirectory(path: string, fn: (isEmpth: boolean) => void) {
    fs.readdir(path, function (err, files) {
        if (err && 'ENOENT' !== err.code) {
            abort(FILEREAD_ERROR);
        }
        fn(!files || !files.length);
    });
}

function confirm(msg: string, fn: (yes: boolean) => void) {
    prompt(msg, function (val) {
        fn(/^ *y(es)?/i.test(val));
    });
}


function prompt(msg: string, fn: (data: string) => void) {
    if (' ' === msg[msg.length - 1]) {
        process.stdout.write(msg);
    } else {
        console.log(msg);
    }
    process.stdin.setEncoding('ascii');
    process.stdin.once('data', function (data:any) {
        fn(data);
    }).resume();
}

function abort(str: string = "") {
    console.error(str);
    process.exit(1);
}


function copy(origin: string, target: string) {
    if (!fs.existsSync(origin)) {
        abort(origin + 'does not exist.');
    }
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
        console.log('   create :  ' + target);
    }
    fs.readdir(origin, function (err, datalist) {
        if (err) {
            abort(FILEREAD_ERROR);
        }
        for (let i = 0; i < datalist.length; i++) {
            let oCurrent = path.resolve(origin, datalist[i]);
            let tCurrent = path.resolve(target, datalist[i]);
            if (fs.statSync(oCurrent).isFile()) {
                fs.writeFileSync(tCurrent, fs.readFileSync(oCurrent, ''), '');
                console.log('   create :  ' + tCurrent);
            } else if (fs.statSync(oCurrent).isDirectory()) {
                copy(oCurrent, tCurrent);
            }
        }
    });
}


function start(opts: any) {
    let absScript = path.resolve(process.cwd(), 'app.js');
    if (!fs.existsSync(absScript)) {
        abort("  ->  Not find the script: " + absScript);
    }

    opts.env = opts.pro ? "production" : "development";

    let ls;
    let params = [absScript, 'env=' + opts.env];
    if (opts.env === "production") {
        ls = spawn(process.execPath, params, { detached: true, stdio: 'ignore' });
        ls.unref();
        process.exit(0);
    } else {
        ls = spawn(process.execPath, params);
        ls.stdout.on('data', function (data) {
            console.log(data.toString());
        });
        ls.stderr.on('data', function (data) {
            console.log(data.toString());
        });
    }
}


function list(opts: any) {
    connectToMaster(opts.host, opts.port, opts.token, function (client) {
        client.request({ "func": "list" }, function (err, servers) {
            if (err) {
                return abort(err);
            }
            var serverTypes: any = {};
            var server;
            for (var i = 0; i < servers.length; i++) {
                server = servers[i];
                server.time = formatTime(server.time);
                serverTypes[server.serverType] = serverTypes[server.serverType] || [];
                serverTypes[server.serverType].push(server);
            }
            for (var x in serverTypes) {
                serverTypes[x].sort(comparer);
            }
            var endArr = [];
            endArr.push(["id", "serverType", "pid", "rss(M)", "heapTotal(M)", "heapUsed(M)", "upTime(d/h/m)"]);
            if (serverTypes["master"]) {
                pushArr(endArr, serverTypes["master"]);
                delete serverTypes["master"];
            }
            for (x in serverTypes) {
                pushArr(endArr, serverTypes[x]);
            }
            formatPrint(endArr);
            abort("");
        });
    });

    function formatTime(time: number) {
        time = Math.floor((Date.now() - time) / 1000);
        var days = Math.floor(time / (24 * 3600));
        time = time % (24 * 3600);
        var hours = Math.floor(time / 3600);
        time = time % 3600;
        var minutes = Math.ceil(time / 60);
        return days + "/" + hours + "/" + minutes;
    }

    var comparer = function (a: { "id": string }, b: { "id": string }) {
        if (a.id < b.id) {
            return -1;
        } else if (a.id > b.id) {
            return 1;
        } else {
            return 0;
        }
    };

    function pushArr(endArr: any[], arr: any) {
        for (var i = 0; i < arr.length; i++) {
            endArr.push([arr[i].id, arr[i].serverType, arr[i].pid, arr[i].rss, arr[i].heapTotal, arr[i].heapUsed, arr[i].time]);
        }
    }
}


function stop(opts: any) {
    connectToMaster(opts.host, opts.port, opts.token, function (client) {
        client.request({ "func": "stop" }, function (err) {
            if (err) {
                return abort(err);
            }
            abort("the application has stopped, please confirm!");
        });
    });
}

function remove(opts: any) {
    if (opts.serverIds.length === 0) {
        return abort("no server input, please use `pomelox remove server-id-1 server-id-2` ")
    }
    connectToMaster(opts.host, opts.port, opts.token, function (client) {
        client.request({ "func": "remove", "args": opts.serverIds }, function (err) {
            if (err) {
                return abort(err);
            }
            abort("the servers have been removed, please confirm!");
        });
    });
}


function formatPrint(strs: string[][]) {
    var i, j;
    for (i = 0; i < strs.length; i++) {
        for (j = 0; j < strs[0].length; j++) {
            strs[i][j] = (strs[i][j] || "").toString();
        }
    }

    var lens = [];
    for (i = 0; i < strs[0].length; i++) {
        lens[i] = strs[0][i].length;
    }

    for (i = 1; i < strs.length; i++) {
        for (j = 0; j < strs[0].length; j++) {
            lens[j] = strs[i][j].length > lens[j] ? strs[i][j].length : lens[j];
        }
    }

    for (i = 0; i < lens.length - 1; i++) {
        lens[i] = lens[i] + 3;
    }

    for (i = 0; i < strs.length; i++) {
        for (j = 0; j < lens.length; j++) {
            strs[i][j] = formatStrLen(strs[i][j], lens[j]);
        }
    }

    console.log("");
    for (i = 0; i < strs.length; i++) {
        let tmpStr = "  " + (strs[i].slice(0, lens.length)).join("");
        console.log(tmpStr)
    }
    console.log("");

    function formatStrLen(str: string, len: number) {
        var add = len - str.length;
        for (var i = 0; i < add; i++) {
            str += " ";
        }
        return str;
    }

}

function connectToMaster(host: string, port: number, token: string, cb: (client: clientProxy) => void) {
    console.log("try to connect  " + host + ":" + port);
    var client = new clientProxy(host, port, token, cb);
}