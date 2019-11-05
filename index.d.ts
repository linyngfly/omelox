
/**
 * 创建 app
 */
export function createApp(): Application;

/**
 * 被创建的app
 */
export let app: Application;

/**
 * omelox版本
 */
export let version: string;

/**
 * 自带两类connector
 */
export let connector: {
    connectorTcp: I_connectorConstructor,
    connectorWs: I_connectorConstructor,
}

/**
 * app 类
 */
export interface Application {

    /**
     * 配置：route.ts
     */
    readonly routeConfig: string[];

    /**
     * 配置：master.ts
     */
    readonly masterConfig: ServerInfo;

    /**
     * 配置：servers.ts
     */
    readonly serversConfig: { readonly [serverType: string]: ServerInfo[] };

    /**
     * 前端服务器，所有的socket连接数
     */
    readonly clientNum: number;

    /**
     * 服务器信息
     */
    readonly servers: { readonly [serverType: string]: ServerInfo[] };

    /**
     * 服务器信息（id格式）
     */
    readonly serversIdMap: { readonly [id: string]: ServerInfo };

    /**
     * 服务器内部认证密钥
     */
    serverToken: string;

    /**
     * master与cli的认证密匙
     */
    cliToken: string;

    /**
     * 本服务器的配置
     */
    readonly serverInfo: ServerInfo;

    /**
     * env
     */
    readonly env: "production" | "development";

    /**
     * ip
     */
    readonly host: string;

    /**
     * port
     */
    readonly port: number;

    /**
     * 服务器id
     */
    readonly serverId: string;

    /**
     * 是否是前端服
     */
    readonly frontend: boolean;

    /**
     * 前端服的监听端口
     */
    readonly clientPort: number;
    /**
     * 服务器类型
     */
    readonly serverType: string;

    /**
     * 服务器启动时刻
     */
    readonly startTime: number;

    /**
     * 消息编码函数
     */
    readonly msgEncode: (cmdId: number, msg: any) => Buffer;

    /**
     * 消息解码函数
     */
    readonly msgDecode: (cmdId: number, msg: Buffer) => any;

    /**
     * rpc
     */
    readonly rpc: (serverId: string) => Rpc;

    /**
     * 服务器启动
     */
    start(): void;

    /**
     * 编码解码回调
     */
    setEncodeDecodeConfig(config: I_encodeDecodeConfig): void

    /**
     * 前端连接服务器配置
     */
    setConnectorConfig(config: I_connectorConfig): void

    /**
     * rpc模块配置
     */
    setRpcConfig(config: { "timeout"?: number, "maxLen"?: number }): void

    /**
     * 设置键值对
     * @param key 键
     * @param value 值
     */
    set<T>(key: string | number, value: T): T
    set(key: string | number, value: any): any

    /**
     * 获取键值对
     * @param key 键
     */
    get(key: string | number): any;
    get<T>(key: string | number): T;

    /**
     * 删除键值对
     * @param key 键
     */
    delete(key: string | number): void;

    /**
     * 获取某一类服务器
     * @param serverType 服务器类型
     */
    getServersByType(serverType: string): ServerInfo[];

    /**
     * 获取某一个服务器
     * @param serverId 服务器id
     */
    getServerById(serverId: string): ServerInfo;

    /**
     * 路由配置   《前端专用》
     * @param serverType 服务器类型
     * @param routeFunc 路由函数
     */
    route(serverType: string, routeFunc: (app: Application, session: Session, serverType: string, cb: (serverId: string) => void) => void): void;

    /**
     * 是否有该客户端   《前端专用》
     * @param uid 标识uid
     */
    hasClient(uid: number): boolean;

    /**
     * 关闭绑定的客户端     《前端专用》
     * @param uid 标识uid
     */
    closeClient(uid: number): void;

    /**
     * 配置部分session   《前端专用》
     * @param uid 标识uid
     * @param settings session里的部分配置
     */
    applySession(uid: number, settings: { [key: string]: any }): void;

    /**
     * 向客户端发送消息  《前端专用》
     * @param cmd 路由
     * @param msg 消息
     * @param uids uid数组
     */
    sendMsgByUid(cmd: string, msg: any, uids: number[]): void;

    /**
     * 向所有的客户端发送消息  《前端专用》
     * @param cmd 路由
     * @param msg 消息
     */
    sendAll(cmd: string, msg: any): void;

    /**
     * 向客户端发送消息  《后端专用》
     * @param cmd 路由
     * @param msg 消息
     * @param uidsid uidsid数组
     */
    sendMsgByUidSid(cmd: string, msg: any, uidsid: { "uid": number, "sid": string }[]): void;

    /**
     * 配置服务器执行函数
     * @param type 服务器类型   "all" 或者 "gate|connector"形式
     * @param cb 
     */
    configure(type: string, cb: () => void): void;

    /**
     * 内部日志输出
     * @param cb 回调函数
     */
    onLog(cb: (level: "info" | "warn" | "error", info: string) => void): void;


    /**
     * 获取bind的socket连接数
     */
    getBindClientNum(): number;

    /**
     * 监听事件（添加服务器，移除服务器）
     * @param event 事件
     * @param cb 回调
     */
    on(event: "onAddServer" | "onRemoveServer", cb: (serverType: string, id: string) => void): void;
}

/**
 * Session 类
 */
export interface Session {
    /**
     * 绑定的uid
     */
    readonly uid: number;

    /**
     * 前端服务器id
     */
    readonly sid: string;

    /**
     * 绑定uid   《前端专用》
     * @param uid 标识uid
     */
    bind(uid: number): boolean;

    /**
     * 设置键值对
     * @param key 键
     * @param value 值
     */
    set<T>(key: number | string, value: T): T;
    set(key: number | string, value: any): any;

    /**
     * 获取键值对
     * @param key 键
     */
    get(key: number | string): any;
    get<T>(key: number | string): T;

    /**
     * 删除键值对
     * @param key 键
     */
    delete(key: number | string): void;

    /**
     * 将后端session同步到前端  《后端专用》
     */
    apply(): void;

    /**
     * 客户端断开连接的回调   《前端专用》
     * @param cb 回调
     */
    setCloseCb(cb: (app: Application, session: Session) => void): void;

    /**
     * 关闭连接   《前端专用》
     */
    close(): void;
}

/**
 * 服务器信息
 */
export interface ServerInfo {
    /**
     * 服务器id
     */
    readonly id: string;
    /**
     * host
     */
    readonly host: string;
    /**
     * port
     */
    readonly port: number;
    /**
     * 是否是前端服务器
     */
    readonly frontend?: boolean;
    /**
     * clientPort
     */
    readonly clientPort: number;

    [key: string]: any;
}

declare global {
    interface Rpc {
    }
}

/**
 * rpc 构造器
 */
export type RpcClass<T> = {
    [K in keyof T]: T[K]
}

/**
 * rpc调用，内部错误码
 */
export const enum rpcErr {
    /**
     * 没有错误
     */
    ok = 0,
    /**
     * 没有目标服务器
     */
    noServer = 1,
    /**
     * rpc超时
     */
    timeout = 2
}

/**
 * 编码解码
 */
export interface I_encodeDecodeConfig {
    /**
     * 协议编码
     */
    "protoEncode"?: (cmdId: number, msg: any) => Buffer,
    /**
     * 消息编码
     */
    "msgEncode"?: (cmdId: number, msg: any) => Buffer,
    /**
     * 协议解码
     */
    "protoDecode"?: (data: Buffer) => { "cmdId": number, "msg": Buffer },
    /**
     * 消息解码
     */
    "msgDecode"?: (cmdId: number, msg: Buffer) => any,
}


/**
 * 前端connector配置
 */
export interface I_connectorConfig {
    /**
     * 自定义connector类
     */
    "connector"?: I_connectorConstructor,
    /**
     * 心跳（秒）
     */
    "heartbeat"?: number,
    /**
     * 最大连接数
     */
    "maxConnectionNum"?: number,
    /**
     * 消息包最大长度
     */
    "maxLen"?: number
}

/**
 * 自定义connector类
 */
export interface I_connectorConstructor {
    new(info: { app: Application, clientManager: I_clientManager, config: { "route": string[], "heartbeat": number, "maxLen": number }, startCb: () => void }): void;
}

/**
 * 用户socket管理代理
 */
export interface I_clientManager {
    addClient(client: I_clientSocket): void;
    handleMsg(client: I_clientSocket, msg: Buffer): void;
    removeClient(client: I_clientSocket): void;
}

/**
 * 用户socket
 */
export interface I_clientSocket {
    /**
     * session（由框架内部赋值）
     */
    session: Session;
    /**
     * ip
     */
    remoteAddress: string;
    /**
     * 发送消息
     */
    send(msg: Buffer): void;
    /**
     * 关闭
     */
    close(): void;
}
