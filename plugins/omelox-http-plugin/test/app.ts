import * as path from 'path';
import { getLogger } from 'omelox-logger';
import { omelox } from 'omelox';
import omeloxHttpPlugin from '../lib/index';

/**
 * Init app for client.
 */
let app = omelox.createApp();

app.set('name', 'gamecity-server-omelox');

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


// Http server configure
app.configure('production|development', 'gate', () => {
    // Load http component
    app.use(omeloxHttpPlugin, {
        host: '127.0.0.1',
        port: 11201,
        useStatic: true,
        staticRoot: '.',
        staticIndex: 'index.html',
        useCluster: false,
        useSSL: false,
        keyFile: 'private.key',
        certFile: 'private.cert',
        views: true
    });
});

// start app
app.start();

