import { omelox } from '../../omelox';
import { Package } from 'omelox-protocol';
import { ISocket } from '../../interfaces/ISocket';

let CODE_OK = 200;
let CODE_USE_ERROR = 500;
let CODE_OLD_CLIENT = 501;

export type HanshakeFunction = (msg: any , cb: (err ?: Error , resp ?: any) => void , socket: ISocket) => void;
export type CheckClientFunction = (type: string, version: string) => boolean;

export interface HandshakeCommandOptions {
    handshake ?: HanshakeFunction;
    heartbeat ?: number;
    checkClient ?: CheckClientFunction;
    useDict ?: boolean;
    useProtobuf ?: boolean;
    useCrypto ?: boolean;
}

/**
 * Process the handshake request.
 *
 * @param {Object} opts option parameters
 *                      opts.handshake(msg, cb(err, resp)) handshake callback. msg is the handshake message from client.
 *                      opts.hearbeat heartbeat interval (level?)
 *                      opts.version required client level
 */
export class HandshakeCommand {
    userHandshake: HanshakeFunction;
    heartbeatSec: number;
    heartbeat: number;
    checkClient: CheckClientFunction;
    useDict: boolean;
    useProtobuf: boolean;
    useCrypto: boolean;

    constructor(opts: HandshakeCommandOptions) {
        opts = opts || {};
        this.userHandshake = opts.handshake;

        if (opts.heartbeat) {
            this.heartbeatSec = opts.heartbeat;
            this.heartbeat = opts.heartbeat * 1000;
        }

        this.checkClient = opts.checkClient;

        this.useDict = opts.useDict;
        this.useProtobuf = opts.useProtobuf;
        this.useCrypto = opts.useCrypto;
    }

    handle(socket: ISocket, msg: any) {
        if (!msg.sys) {
            processError(socket, CODE_USE_ERROR);
            return;
        }

        if (typeof this.checkClient === 'function') {
            if (!msg || !msg.sys || !this.checkClient(msg.sys.type, msg.sys.version)) {
                processError(socket, CODE_OLD_CLIENT);
                return;
            }
        }

        let opts: any = {
            heartbeat: setupHeartbeat(this)
        };

        if (this.useDict) {
            let dictVersion = omelox.app.components.__dictionary__.getVersion();
            if (!msg.sys.dictVersion || msg.sys.dictVersion !== dictVersion) {

                // may be deprecated in future
                opts.dict = omelox.app.components.__dictionary__.getDict();

                // 用不到这个。
            //    opts.routeToCode = omelox.app.components.__dictionary__.getDict();
           //     opts.codeToRoute = omelox.app.components.__dictionary__.getAbbrs();
                opts.dictVersion = dictVersion;
            }
            opts.useDict = true;
        }

        if (this.useProtobuf) {
            let protoVersion = omelox.app.components.__protobuf__.getVersion();
            if (!msg.sys.protoVersion || msg.sys.protoVersion !== protoVersion) {
                opts.protos = omelox.app.components.__protobuf__.getProtos();
            }
            opts.useProto = true;
        }

        if (!!omelox.app.components.__decodeIO__protobuf__) {
            if (!!this.useProtobuf) {
                throw new Error('protobuf can not be both used in the same project.');
            }
            let component = omelox.app.components.__decodeIO__protobuf__ as any;
            let version = component.getVersion();
            if (!msg.sys.protoVersion || msg.sys.protoVersion < version) {
                opts.protos = component.getProtos();
            }
            opts.useProto = true;
        }

        if (this.useCrypto) {
            omelox.app.components.__connector__.setPubKey(socket.id, msg.sys.rsa);
        }

        if (typeof this.userHandshake === 'function') {
            this.userHandshake(msg, function (err, resp) {
                if (err) {
                    process.nextTick(function () {
                        processError(socket, CODE_USE_ERROR);
                    });
                    return;
                }
                process.nextTick(function () {
                    response(socket, opts, resp);
                });
            }, socket);
            return;
        }

        process.nextTick(function () {
            response(socket, opts);
        });
    }

}

let setupHeartbeat = function (self: HandshakeCommand) {
    return self.heartbeatSec;
};

let response = function (socket: ISocket, sys: any, resp ?: any) {
    let res: any = {
        code: CODE_OK,
        sys: sys
    };
    if (resp) {
        res.user = resp;
    }
    socket.handshakeResponse(Package.encode(Package.TYPE_HANDSHAKE, Buffer.from(JSON.stringify(res))));
};

let processError = function (socket: ISocket, code: number) {
    let res = {
        code: code
    };
    socket.sendForce(Package.encode(Package.TYPE_HANDSHAKE, Buffer.from(JSON.stringify(res))));
    process.nextTick(function () {
        socket.disconnect();
    });
};
