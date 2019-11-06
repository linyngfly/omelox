﻿import { Application , IPlugin , getPluginHandlerPath , getPluginRemotePath} from 'pinus';


/**
 * 实现一个基本的GateWay插件，插件载入时，会被自动扫描handlerPath和remoterPath指向的目录
 */
export class BaseGatePlugin implements IPlugin {
    name = 'BaseGatePlugin';

    // 在插件里扫描handler目录
    handlerPath = getPluginHandlerPath(__dirname);
    // 在插件里扫描remoter目录
    remoterPath = getPluginRemotePath(__dirname);
}
