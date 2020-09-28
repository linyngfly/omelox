import { Application, FRONTENDID, UID } from 'omelox';
import * as path from 'path';
import { getLogger } from 'omelox-logger';
const logger = getLogger('omelox', path.basename(__filename));
import * as redis from 'redis';
import { utils } from '../util/utils';

let DEFAULT_PREFIX = 'plugin:globalChannel';

export class GlobalChannelManager {
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
      logger.error('plugin globalChannel redis connect error ', error.stack);
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

  destroyChannel(name: string, cb: Function) {
    let servers = this.app.getServers();
    let server, cmds = [];
    for (let sid in servers) {
      server = servers[sid];
      if (this.app.isFrontend(server)) {
        cmds.push(['del', genKey(this, name, sid)]);
      }
    }
    execMultiCommands(this.redisClient, cmds, cb);
  }

  add(name: string, uid: UID, sid: FRONTENDID, cb: Function) {
    this.redisClient.sadd(genKey(this, name, sid), uid, function (err: any) {
      utils.invokeCallback(cb, err);
    });
  }

  leave(name: string, uid: UID, sid: FRONTENDID, cb: Function) {
    this.redisClient.srem(genKey(this, name, sid), uid, function (err: any) {
      utils.invokeCallback(cb, err);
    });
  }

  getMembersBySid(name: string, sid: FRONTENDID, cb: Function) {
    this.redisClient.smembers(genKey(this, name, sid), function (err, list) {
      utils.invokeCallback(cb, err, list);
    });
  }
}

const execMultiCommands = function (redisClient: redis.RedisClient, cmds: any, cb: Function) {
  if (!cmds.length) {
    utils.invokeCallback(cb);
    return;
  }
  redisClient.multi(cmds).exec(function (err: any, replies: any) {
    utils.invokeCallback(cb, err);
  });
};

const genKey = function (self: any, name: string, sid: string) {
  return DEFAULT_PREFIX + ':' + name + ':' + sid;
};

const genCleanKey = function (self: any) {
  return DEFAULT_PREFIX + '*';
};
