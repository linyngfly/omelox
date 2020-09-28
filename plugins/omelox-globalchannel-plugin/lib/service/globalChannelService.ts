import { GlobalChannelManager } from '../manager/redisGlobalChannelManager';
import { utils } from '../util/utils';
import { CountDownLatch } from '../util/countDownLatch';
import { Application, UID } from 'omelox';
import * as path from 'path';
import { getLogger } from 'omelox-logger';
import { FRONTENDID } from '../../../../packages/omelox/lib/util/constants';
const logger = getLogger('omelox', path.basename(__filename));

enum ST {
  ST_INITED = 0,
  ST_STARTED = 1,
  ST_CLOSED = 2,
}

/**
 * Global channel service.
 * GlobalChannelService is created by globalChannel component which is a default
 * component of omelo enabled by `app.set('globalChannelConfig', {...})`
 * and global channel service would be accessed by
 * `app.get('globalChannelService')`.
 *
 * @class
 * @constructor
 */
export class GlobalChannelService {
  opts: any;
  manager: GlobalChannelManager;
  cleanOnStartUp: boolean;
  state: ST;

  constructor(private app: Application, opts: any) {
    this.opts = opts || {};
    this.manager = getChannelManager(app, opts);
    this.cleanOnStartUp = opts.cleanOnStartUp;
    this.state = ST.ST_INITED;
  }

  start(cb: Function) {
    if (this.state !== ST.ST_INITED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    if (typeof this.manager.start === 'function') {
      let self = this;
      this.manager.start(function (err: any) {
        if (!err) {
          self.state = ST.ST_STARTED;
        }
        if (!!self.cleanOnStartUp) {
          self.manager.clean(function (err1: any) {
            utils.invokeCallback(cb, err1);
          });
        } else {
          utils.invokeCallback(cb, err);
        }
      });
    } else {
      process.nextTick(function () {
        utils.invokeCallback(cb);
      });
    }
  }

  stop(force: boolean, cb: Function) {
    this.state = ST.ST_CLOSED;

    if (typeof this.manager.stop === 'function') {
      this.manager.stop(force, cb);
    } else {
      process.nextTick(function () {
        utils.invokeCallback(cb);
      });
    }
  }

  destroyChannel(name: string, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    this.manager.destroyChannel(name, cb);
  }

  add(name: string, uid: UID, sid: FRONTENDID, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    this.manager.add(name, uid, sid, cb);
  }

  leave(name: string, uid: UID, sid: FRONTENDID, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    this.manager.leave(name, uid, sid, cb);
  }

  getMembersBySid(name: string, sid: FRONTENDID, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    this.manager.getMembersBySid(name, sid, cb);
  }

  getMembersByChannelName(stype: string, name: string, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }
    let members: any[] = [];
    let servers = this.app.getServersByType(stype);

    if (!servers || servers.length === 0) {
      utils.invokeCallback(cb, null, []);
      return;
    }

    let latch = CountDownLatch.createCountDownLatch(servers.length, function () {
      utils.invokeCallback(cb, null, members);
      return;
    });

    for (let i = 0, l = servers.length; i < l; i++) {
      this.getMembersBySid(name, servers[i].id, function (err: any, list: any) {
        if (err) {
          utils.invokeCallback(cb, err, null);
          return;
        }
        if (list && list.length !== 0) {
          list.forEach(function (member: any) {
            members.push(member);
          });
        }
        latch.done();
      });
    }
  }

  pushMessage(serverType: string, route: string, msg: any,
    channelName: string, opts: any, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    let namespace = 'sys';
    let service = 'channelRemote';
    let method = 'pushMessage';
    let failIds: any[] = [];

    let servers = this.app.getServersByType(serverType);

    if (!servers || servers.length === 0) {
      // no frontend server infos
      utils.invokeCallback(cb, null, failIds);
      return;
    }

    let successFlag = false;
    let latch = CountDownLatch.createCountDownLatch(servers.length, function () {
      if (!successFlag) {
        utils.invokeCallback(cb, new Error('all frontend server push message fail'));
        return;
      }
      utils.invokeCallback(cb, null, failIds);
    });

    let rpcCB = function (err: any, fails: any) {
      if (err) {
        logger.error('[pushMessage] fail to dispatch msg, err:' + err.stack);
        latch.done();
        return;
      }
      if (fails) {
        failIds = failIds.concat(fails);
      }
      successFlag = true;
      latch.done();
    };


    for (let i = 0, l = servers.length; i < l; i++) {
      (function (self, arg) {
        self.getMembersBySid(channelName, servers[arg].id, function (err: any, uids: UID[]) {
          if (err) {
            logger.error('[getMembersBySid] fail to get members, err' + err.stack);
          }
          if (uids && uids.length > 0) {
            self.app.rpcInvoke(servers[arg].id, {
              namespace: namespace, service: service,
              method: method, args: [route, msg, uids, { isPush: true }]
            }, rpcCB);
          } else {
            process.nextTick(rpcCB);
          }
        });
      })(this, i);
    }
  }

}

const getChannelManager = function (app: Application, opts: any) {
  let manager;
  if (typeof opts.channelManager === 'function') {
    manager = opts.channelManager(app, opts);
  } else {
    manager = opts.channelManager;
  }

  if (!manager) {
    manager = new GlobalChannelManager(app, opts);
  }

  return manager;
};
