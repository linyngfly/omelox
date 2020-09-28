import { Application, UID, FRONTENDID } from 'omelox';
import { StatusManager } from '../manager/statusManager';
import { utils } from '../util/utils';
import * as util from 'util';
import { CountDownLatch } from '../util/countDownLatch';

enum ST {
  ST_INITED = 0,
  ST_STARTED = 1,
  ST_CLOSED = 2,
}

export class GlobalStatusService {
  opts: any;
  manager: StatusManager;
  cleanOnStartUp: boolean;
  state: ST;
  constructor(private app: Application, opts: any) {
    this.opts = opts || {};
    this.cleanOnStartUp = opts.cleanOnStartUp || true;
    this.manager = getStatusManager(app, opts);
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

  add(uid: UID, sid: FRONTENDID, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    this.manager.add(uid, sid, cb);
  }

  leave(uid: UID, sid: FRONTENDID, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    this.manager.leave(uid, sid, cb);
  }

  getSidsByUid(uid: UID, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    this.manager.getSidsByUid(uid, cb);
  }

  getStatusByUid(uid: UID, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    this.manager.getSidsByUid(uid, function (err: any, list: any[]) {
      if (!!err) {
        utils.invokeCallback(cb, new Error(util.format('failed to get serverIds by uid: [%s], err: %j', uid, err.stack)), null);
        return;
      }
      let status = (list !== undefined && list.length >= 1)
        ? true // online
        : false; // offline
      utils.invokeCallback(cb, null, status);
    });
  }

  getStatusByUids(uids: UID[], cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }

    this.manager.getSidsByUids(uids, function (err: any, replies: any) {
      if (!!err) {
        utils.invokeCallback(cb, new Error(util.format('failed to get serverIds by uids, err: %j', err.stack)), null);
        return;
      }

      let statuses: any = {
      };
      for (let i = 0; i < uids.length; i++) {
        statuses[uids[i]] = (replies[i] === 1)
          ? true // online
          : false; // offline
      }

      utils.invokeCallback(cb, null, statuses);
    });
  }

  pushByUids(uids: UID[], route: string, msg: any, cb: Function) {
    if (this.state !== ST.ST_STARTED) {
      utils.invokeCallback(cb, new Error('invalid state'));
      return;
    }
    let channelService = this.app.get('channelService');
    let successFlag = false;
    let count = utils.size(uids);
    let records: any[] = [];

    let latch = CountDownLatch.createCountDownLatch(count, function () {
      if (!successFlag) {
        utils.invokeCallback(cb, new Error(util.format('failed to get sids for uids: %j', uids)), null);
        return;
      }
      else {
        if (records != null && records.length !== 0) {
          channelService.pushMessageByUids(route, msg, records, cb);
        } else {
          utils.invokeCallback(cb, null, null);
        }
      }
    });

    for (let i = 0; i < uids.length; i++) {
      (function (self, arg) {
        self.getSidsByUid(uids[arg], function (err: any, list: any[]) {
          if (!!err) {
            utils.invokeCallback(cb, new Error(util.format('failed to get serverIds by uid: [%s], err: %j', uids[arg], err.stack)), null);
            return;
          }
          for (let j = 0, l = list.length; j < l; j++) {
            records.push({
              uid: uids[arg], sid: list[j]
            });
          }

          successFlag = true;
          latch.done();
        });
      })(this, i);
    }
  }

}


let getStatusManager = function (app: Application, opts: any) {
  let manager: StatusManager;
  if (typeof opts.statusManager === 'function') {
    manager = opts.statusManager(app, opts);
  } else {
    manager = opts.statusManager;
  }
  if (!manager) {
    manager = new StatusManager(app, opts);
  }
  return manager;
};
