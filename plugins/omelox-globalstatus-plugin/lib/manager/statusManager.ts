import { getLogger } from 'omelox-logger';
import * as path from 'path';
const logger = getLogger('omelox', path.basename(__filename));
import { Application } from 'omelox';
import * as redis from 'redis';
import { promisify } from 'util';
import { utils } from '../util/utils';

// let redis = require('redis');

let DEFAULT_PREFIX = 'plugin:globalStatus';

// let StatusManager = function (app: Application, opts: any) {
//   this.app = app;
//   this.opts = opts || {};
//   this.prefix = opts.prefix || DEFAULT_PREFIX;
//   this.host = opts.host;
//   this.port = opts.port;
//   this.redis = null;
// };

export class StatusManager {
  opts: any;
  prefix: string;
  host: string;
  port: number;
  redisClient: redis.RedisClient = null;
  constructor(private app: Application, opts: any) {
    opts.password = opts.auth ? opts.password : null;
    opts.prefix = opts.prefix || 'plugin:http';
    this.opts = opts || {};
    this.prefix = opts.prefix || DEFAULT_PREFIX;
    this.host = opts.host;
    this.port = opts.port;
  }

  start(cb) {
    this.redisClient = redis.createClient(this.opts);
    this.redisClient.on('error', function (error: any) {
      logger.error('plugin globalStatus redis connect error ', error.stack);
    });

    // this.redisClient = redis.createClient(this.opts);
    // if (this.opts.auth_pass) {
    //   this.redis.auth(this.opts.auth_pass);
    // }
    // this.redis.on('error', function (err) {
    //   console.error('[status-plugin][redis]' + err.stack);
    // });
    // this.redis.once('ready', cb);
  }

  stop(force: boolean, cb: Function) {
    if (this.redisClient) {
      this.redisClient.end();
      this.redisClient = null;
    }
    utils.invokeCallback(cb);
  }

  clean(cb: Function) {
    let cmds = [];
    let self = this;
    this.redis.keys(genCleanKey(this), function (err, list) {
      if (!!err) {
        utils.invokeCallback(cb, err);
        return;
      }
      for (let i = 0; i < list.length; i++) {
        cmds.push(['del', list[i]]);
      }
      execMultiCommands(self.redis, cmds, cb);
    });
  }

  add(uid, sid, cb) {
    this.redis.sadd(genKey(this, uid), sid, function (err) {
      utils.invokeCallback(cb, err);
    });
  }

  leave(uid, sid, cb) {
    this.redis.srem(genKey(this, uid), sid, function (err) {
      utils.invokeCallback(cb, err);
    });
  }

  getSidsByUid = function (uid, cb) {
    this.redis.smembers(genKey(this, uid), function (err, list) {
      utils.invokeCallback(cb, err, list);
    });
  }

  getSidsByUids = function (uids, cb) {
    let cmds = [];
    for (let i = 0; i < uids.length; i++) {
      cmds.push(['exists', genKey(this, uids[i])]);
    }
    execMultiCommands(this.redis, cmds, function (err, list) {
      utils.invokeCallback(cb, err, list);
    });
  }
}


let execMultiCommands = function (redis, cmds, cb) {
  if (!cmds.length) {
    utils.invokeCallback(cb);
    return;
  }
  redis.multi(cmds).exec(function (err, replies) {
    utils.invokeCallback(cb, err, replies);
  });
};

let genKey = function (self, uid) {
  return self.prefix + ':' + uid;
};

let genCleanKey = function (self) {
  return self.prefix + '*';
};
