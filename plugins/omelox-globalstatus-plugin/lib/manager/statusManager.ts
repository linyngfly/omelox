import { getLogger } from 'omelox-logger';
import * as path from 'path';
const logger = getLogger('omelox', path.basename(__filename));
import { Application, FRONTENDID, UID } from 'omelox';
import * as redis from 'redis';
import { utils } from '../util/utils';

let DEFAULT_PREFIX = 'plugin:globalStatus';

export class StatusManager {
  prefix: string;
  host: string;
  port: number;
  redisClient: redis.RedisClient = null;
  constructor(private app: Application, private opts: any) {
  }

  start(cb: Function) {
    this.redisClient = redis.createClient({
      host: this.opts.host,
      port: this.opts.port,
      db: this.opts.db,
      prefix: this.opts.prefix,
    });

    if (this.opts.auth) {
      this.redisClient.auth(this.opts.password);
    }

    this.redisClient.on('error', function (error: any) {
      logger.error('plugin globalStatus redis connect error ', error.stack);
    });

    this.redisClient.once('ready', () => {
      utils.invokeCallback(cb);
    });
  }

  stop(force: boolean, cb: Function) {
    if (this.redisClient) {
      this.redisClient.end();
      this.redisClient = null;
    }
    utils.invokeCallback(cb);
  }

  clean(cb: Function) {
    let cmds: any[] = [];
    let self = this;
    this.redisClient.keys(genCleanKey(this), function (err: any, list: any[]) {
      if (!!err) {
        utils.invokeCallback(cb, err);
        return;
      }
      for (let i = 0; i < list.length; i++) {
        cmds.push(['del', list[i]]);
      }
      execMultiCommands(self.redisClient, cmds, cb);
    });
  }

  add(uid: UID, sid: FRONTENDID, cb: Function) {
    this.redisClient.sadd(genKey(this, uid), sid, function (err: any) {
      utils.invokeCallback(cb, err);
    });
  }

  leave(uid: UID, sid: FRONTENDID, cb: Function) {
    this.redisClient.srem(genKey(this, uid), sid, function (err: any) {
      utils.invokeCallback(cb, err);
    });
  }

  getSidsByUid(uid: UID, cb: Function) {
    this.redisClient.smembers(genKey(this, uid), function (err: any, list: any) {
      utils.invokeCallback(cb, err, list);
    });
  }

  getSidsByUids(uids: UID[], cb: Function) {
    let cmds = [];
    for (let i = 0; i < uids.length; i++) {
      cmds.push(['exists', genKey(this, uids[i])]);
    }
    execMultiCommands(this.redisClient, cmds, function (err: any, list: any) {
      utils.invokeCallback(cb, err, list);
    });
  }
}


let execMultiCommands = function (redisClient: redis.RedisClient, cmds: any, cb: Function) {
  if (!cmds.length) {
    utils.invokeCallback(cb);
    return;
  }
  redisClient.multi(cmds).exec(function (err: any, replies: any) {
    utils.invokeCallback(cb, err, replies);
  });
};

let genKey = function (self: any, uid: any) {
  return DEFAULT_PREFIX + ':' + uid;
};

let genCleanKey = function (self: any) {
  return DEFAULT_PREFIX + '*';
};
