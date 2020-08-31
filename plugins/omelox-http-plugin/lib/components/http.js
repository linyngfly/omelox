const Koa = require('koa');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('../body');
const session = require("../session");
const RedisStore = require("../session/redisStore");

const logger = require('omelo-logger').getLogger('omelo-rpc', __filename);

const cors = require('../cors');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Router = require('koa-router');

module.exports = function (app, opts) {
  var service = new Http(app, opts);
  app.set('httpService', service, true);
  service.name = '__http__';
  return service;
};

let Http = function (app, opts) {
  if (!opts) {
    assert.ok(false, 'http config is empty');
    process.exit(0);
    return;
  }

  this.app = app;
  this.http = new Koa();

  let serverType = app.getServerType();
  let serverId = app.getServerId();
  opts = opts[serverType];
  opts.forEach(function (item) {
    if (item.id == serverId) {
      opts = item;
    }
  });

  if (!opts) {
    assert.ok(false, serverId + ' http config is empty');
    process.exit(0);
    return;
  }
  this.opts = opts;
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
      store: new RedisStore(opts.session.store),
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

  this.beforeFilters = require('../../index').beforeFilters;
  this.afterFilters = require('../../index').afterFilters;
  this.server = null;
};

Http.prototype.loadRoutes = function () {

  let routesPath = path.join(this.app.getBase(), 'app/servers', this.app.getServerType(), 'routes');
  assert.ok(fs.existsSync(routesPath), 'Cannot find route path: ' + routesPath);

  let self = this;
  fs.readdirSync(routesPath).forEach(function (file) {
    if (/.js$/.test(file)) {
      let routePath = path.join(routesPath, file);

      const router = new Router();
      require(routePath)(router);
      // routes
      self.http.use(router.routes(), router.allowedMethods());
    }
  });
};

Http.prototype.start = function (cb) {
  let self = this;

  this.beforeFilters.forEach(function (elem) {
    self.http.use(elem);
  });

  // logger
  this.http.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
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

  this.afterFilters.forEach(function (elem) {
    self.http.use(elem);
  });

  if (this.useCluster && cluster.isMaster) {

    // 跟踪 http 请求
    // let numReqs = {};
    // setInterval(() => {
    //   logger.info(`numReqs = ${JSON.stringify(numReqs)}`);
    // }, 1000);

    // 计算请求数目
    // function messageHandler(msg) {
    //   console.error('11msg=', msg);
    //   if (msg.cmd && msg.cmd === 'notifyRequest') {
    //     console.error('msg=', msg);
    //     numReqs[msg.pid] += 1;
    //   }
    // }

    // 启动 worker 并监听包含 notifyRequest 的消息
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    // for (const id in cluster.workers) {
    //   numReqs[cluster.workers[id].process.pid] = 0;
    //   cluster.workers[id].on('message', messageHandler);
    // }

    cluster.on('exit', (worker, code, signal) => {
      logger.info(`http Work process ${worker.process.pid} exit`);
    });

    logger.info(`http cluster master ${process.pid} running`);
  } else {
    if (this.useSSL) {
      this.server = https.createServer(this.sslOpts, this.http.callback()).listen(this.port, this.host, function () {
        logger.info('http start', self.app.getServerId(), 'url: https://' + self.host + ':' + self.port);
        logger.info('http start success');
        process.nextTick(cb);
      });
    } else {
      this.server = http.createServer(this.http.callback()).listen(this.port, this.host, function () {
        logger.info('http start', self.app.getServerId(), 'url: http://' + self.host + ':' + self.port);
        logger.info('http start success');
        process.nextTick(cb);
      });
    }

    logger.info(`http Work process ${process.pid} running`);
  }
};

Http.prototype.afterStart = function (cb) {
  logger.info('Http afterStart');
  process.nextTick(cb);
};

Http.prototype.stop = function (force, cb) {
  let self = this;
  this.server.close(function () {
    logger.info('Http stop');
    cb();
  });
};