import * as Koa from 'koa';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import * as views from 'koa-views';
import * as json from 'koa-json';
import * as onerror from 'koa-onerror';
import cors from '../cors';
import bodyparser from '../body';
import session from '../session';
import { IComponent, Application } from 'omelox';

import * as cluster from 'cluster';
import * as os from 'os';
const numCPUs = os.cpus().length;
import * as Router from 'koa-router';
import { getLogger, ILogger } from 'omelox-logger';
let logger = getLogger('omelox', path.basename(__filename));


export class KoaHttpComponent implements IComponent {
    name = 'KoaHttpComponent';
    app: Application;
    opts: any = null;
    http: Koa = null;
    useCluster: boolean = false;
    useSSL: boolean = false;
    sslOpts: any = {};
    host: string;
    port: number;
    httpServer: Server

    static beforeFilters: any[] = [];
    static afterFilters: any[] = [];

    constructor(app: Application, opts: any) {
        console.log(`KoaHttpComponent constructor app:${app.getBase()} opts:${opts ? JSON.stringify(opts) : ''}`);
        this.app = app;
        this.http = new Koa();

        let serverType = app.getServerType();
        let serverId = app.getServerId();
        let serverOpts = opts[serverType];
        serverOpts.forEach(function (item) {
            if (item.id === serverId) {
                serverOpts = item;
            }
        });

        if (!serverOpts) {
            assert.ok(false, 'http config is empty');
            process.exit(0);
            return;
        }
        this.opts = serverOpts;
        this.useCluster = opts.useCluster;

        if (opts.useSSL) {
            this.host = opts.https.host;
            this.port = opts.https.port;
            this.sslOpts = {};
            this.sslOpts.key = fs.readFileSync(path.join(app.getBase(), opts.https.keyFile));
            this.sslOpts.cert = fs.readFileSync(path.join(app.getBase(), opts.https.certFile));
            this.useSSL = true;
        } else {
            this.host = opts.http.host;
            this.port = opts.http.port;
        }

        // session
        if (!!opts.session) {
            this.http.use(session({
                // store: new RedisStore(opts.session.store),
                maxAge: opts.session.maxAge
            }));
        }

        // error handler
        onerror(this.http);

        // middlewares
        if (opts.cors !== false) {
            this.http.use(cors({
                credentials: true,
                allowMethods: ['GET', 'POST', 'DELETE'],
                allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
            }));
        }

        this.http.use(bodyparser());
        this.http.use(json());

        if (opts.views) {
            this.http.use(views(path.join(this.app.getBase(), 'app/servers', this.app.getServerType(), 'views'), {
                extension: 'ejs'
            }));
        }
    }

    loadRoutes() {
        let routesPath = path.join(this.app.getBase(), 'app/servers', this.app.getServerType(), 'routes');
        assert.ok(fs.existsSync(routesPath), 'Cannot find route path: ' + routesPath);

        fs.readdirSync(routesPath).forEach((file) => {
            if (/.js$/.test(file)) {
                let routePath = path.join(routesPath, file);

                const router = new Router();
                require(routePath)(router);
                // routes
                this.http.use(router.routes(), router.allowedMethods());
            }
        });
    }

    start(cb) {
        KoaHttpComponent.beforeFilters.forEach((item) => {
            this.http.use(item);
        })

        // logger
        this.http.use(async (ctx, next) => {
            const start = new Date();
            await next();
            const ms = new Date().getTime() - start.getTime();
            logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);

            // 通知 master 进程接收到了请求
            process.send && process.send({
                cmd: 'notifyRequest',
                pid: process.pid
            });
        });

        if (this.opts.static) {
            this.http.use(require('koa-static')(path.join(this.app.getBase(), 'app/servers', this.app.getServerType(), 'public')));
        }

        this.loadRoutes();

        KoaHttpComponent.afterFilters.forEach((item) => {
            this.http.use(item);
        })

        if (this.useCluster && cluster.isMaster) {

            // 启动 worker 并监听包含 notifyRequest 的消息
            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }

            cluster.on('exit', (worker, code, signal) => {
                logger.info(`http Work process ${worker.process.pid} exit`);
            });

            logger.info(`http cluster master ${process.pid} running`);
        } else {
            if (this.useSSL) {
                this.httpServer = https.createServer(this.sslOpts, this.http.callback()).listen(this.port, this.host, function () {
                    logger.info('http start', this.app.getServerId(), 'url: https://' + this.host + ':' + this.port);
                    logger.info('http start success');
                    process.nextTick(cb);
                });
            } else {
                this.httpServer = http.createServer(this.http.callback()).listen(this.port, this.host, function () {
                    logger.info('http start', this.app.getServerId(), 'url: http://' + this.host + ':' + this.port);
                    logger.info('http start success');
                    process.nextTick(cb);
                });
            }

            logger.info(`http Work process ${process.pid} running`);
        }
    }

    afterStart(cb) {
        logger.info('Http afterStart');
        process.nextTick(cb);
    }

    stop(force, cb) {
        this.httpServer.close(function () {
            logger.info('Http stop');
            cb();
        });
    }
}