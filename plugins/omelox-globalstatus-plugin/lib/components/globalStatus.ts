import { getLogger } from 'omelox-logger';
import * as path from 'path';
const logger = getLogger('omelox', path.basename(__filename));
import { Application, IComponent } from 'omelox';
import { GlobalStatusService } from '../service/statusService';

export class GlobalStatusComponent implements IComponent {
  name = 'GlobalStatusComponent';
  globalStatusService: GlobalStatusService;

  constructor(app: Application, opts: any) {
    this.globalStatusService = new GlobalStatusService(app, opts);
    app.set('globalStatusService', this.globalStatusService, true);
  }

  start(cb: Function) {
    this.globalStatusService.start(cb);
  }

  afterStart(cb: Function) {
    logger.info('GlobalStatusComponent afterStart');
    process.nextTick(cb);
  }

  stop(force: any, cb: Function) {
    this.globalStatusService.stop(force, cb);
  }

}