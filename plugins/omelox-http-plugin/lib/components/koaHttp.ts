import * as Koa from 'koa';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import * as views from 'koa-views';
import * as json from 'koa-json';
const onerror = require('koa-onerror');
import * as koastatic from 'koa-static';
import cors from '../cors';
import bodyparser from '../body';
import session, { genStore, StoreType } from '../session';
import { IComponent, Application } from 'omelox';
import * as cluster from 'cluster';
import * as os from 'os';
const numCPUs = os.cpus().length;
import * as Router from 'koa-router';
import { getLogger } from 'omelox-logger';
const logger = getLogger('omelox', path.basename(__filename));

interface HttpOpts {
    cors: boolean;
}
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
    httpServer: https.Server | http.Server;

    static beforeFilters: any[] = [];
    static afterFilters: any[] = [];

    constructor(app: Application, opts: any) {
        logger.info(`KoaHttpComponent constructor app:${app.getBase()} opts:${opts ? JSON.stringify(opts) : ''}`);
        this.app = app;
        this.http = new Koa();

        let serverType = app.getServerType();
        let serverId = app.getServerId();
        let serverOpts = opts[serverType];
        if (!serverOpts) {
            assert.ok(false, `${serverType} http config is empty`);
            process.exit(0);
            return;
        }

        serverOpts.forEach((item: any) => {
            if (item.id === serverId) {
                this.opts = item;
            }
        });

        if (!this.opts) {
            assert.ok(false, `${serverType}-${serverId} http config is empty`);
            process.exit(0);
            return;
        }

        this.useCluster = this.opts.useCluster;
        this.host = this.opts.host;
        this.port = this.opts.port;
        if (this.opts.useSSL) {
            this.sslOpts = {};
            this.sslOpts.key = fs.readFileSync(path.join(app.getBase(), this.opts.keyFile));
            this.sslOpts.cert = fs.readFileSync(path.join(app.getBase(), this.opts.certFile));
            this.useSSL = true;
        }

        // session
        if (!!this.opts.session) {
            let sessionOpts: any = {
                maxAge: this.opts.session.maxAge
            }

            if (!!this.opts.session.redis) {
                sessionOpts.store = genStore(StoreType.Redis, this.opts.session.redis);
            } else if (!!this.opts.session.memoryCache) {
                sessionOpts.store = genStore(StoreType.MemoryCache, this.opts.session.memoryCache);
            } else if (!!this.opts.session.Mysql) {
                sessionOpts.store = genStore(StoreType.Mysql, this.opts.session.mysql);
            }
            this.http.use(session(sessionOpts));
        }

        // error handler
        onerror(this.http);

        // middlewares
        if (this.opts.cors !== false) {
            this.http.use(cors({
                credentials: true,
                allowMethods: ['GET', 'POST', 'DELETE'],
                allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
            }));
        }

        this.http.use(bodyparser(this.opts.body || {}));
        this.http.use(json());

        if (this.opts.views) {
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
                this.http.use(router.routes());
            }
        });
    }

    start(cb: Function) {
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

        if (this.opts.useStatic) {
            let staticRoot = this.opts.staticRoot || path.join(this.app.getBase(), 'app/servers', this.app.getServerType(), 'public');
            let staticOpts: any = {};
            staticOpts.index = 'index.html' || this.opts.staticIndex;
            this.http.use(koastatic(staticRoot, staticOpts));
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
                this.httpServer = https.createServer(this.sslOpts, this.http.callback()).listen(this.port, this.host, () => {
                    logger.info('http start', this.app.getServerId(), 'url: https://' + this.host + ':' + this.port);
                    logger.info('http start success');
                    process.nextTick(cb);
                });
            } else {
                this.httpServer = http.createServer(this.http.callback()).listen(this.port, this.host, () => {
                    logger.info('http start', this.app.getServerId(), 'url: http://' + this.host + ':' + this.port);
                    logger.info('http start success');
                    process.nextTick(cb);
                });
            }

            logger.info(`http Work process ${process.pid} running`);
        }
    }

    afterStart(cb: Function) {
        logger.info('Http afterStart');
        process.nextTick(cb);
    }

    stop(force: any, cb: Function) {
        this.httpServer.close(function () {
            logger.info('Http stop');
            cb();
        });
    }
}