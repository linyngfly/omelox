import { getLogger } from 'omelox-logger';
import * as path from 'path';
const logger = getLogger('omelox', path.basename(__filename));
import { Application, IApplicationEvent, Session } from 'omelox';
import { GlobalStatusService } from '../service/statusService';

export class GlobalStatusEvent implements IApplicationEvent {
  globalStatusService: GlobalStatusService;

  constructor(private app: Application) {
    this.app = app;
    this.globalStatusService = app.get('globalStatusService');
  }

  bind_session(session: Session): void {
    if (!session.uid) {
      return;
    }
    this.globalStatusService.add(session.uid, session.frontendId, function (err: any) {
      if (!!err) {
        logger.error('GlobalStatusService add user failed: [%s] [%s], err: %j', session.uid, session.frontendId, err);
        return;
      }
    });
  }

  close_session(session: Session): void {
    if (!session.uid) {
      return;
    }
    // don't remove entry if another session for the same user on the same frontend remain
    let currentUserSessions = this.app.get('sessionService').getByUid(session.uid);
    if (currentUserSessions !== undefined) {
      logger.debug('at least another session exists for this user on this frontend: [%s] [%s]', session.uid, session.frontendId);
      return;
    }
    this.globalStatusService.leave(session.uid, session.frontendId, function (err: any) {
      if (!!err) {
        logger.error('failed to kick user in GlobalStatusService: [%s] [%s], err: %j', session.uid, session.frontendId, err);
        return;
      }
    });
  }

}