import { omelox } from 'omelox';
import { preload } from './preload';
import { createBasePlugin } from 'omelox-base-plugin';

/**
 *  替换全局Promise
 *  自动解析sourcemap
 *  捕获全局错误
 */
preload();

/**
 * Init app for client.
 */
let app = omelox.createApp();
app.set('name', 'omelox-example');

// app configuration
app.configure('production|development', 'connector', function () {
    app.set('connectorConfig',
        {
            connector: omelox.connectors.hybridconnector,
            heartbeat: 3,
            useDict: true,
            useProtobuf: true
        });
});

// 载入测试的组件
app.use(createBasePlugin());

// start app
app.start();

