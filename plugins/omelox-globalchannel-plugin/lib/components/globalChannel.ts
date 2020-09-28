import { Application, IComponent } from 'omelox';
import { GlobalChannelService } from '../service/globalChannelService';
import * as path from 'path';
import { getLogger } from 'omelox-logger';
const logger = getLogger('omelox', path.basename(__filename));

export class GlobalChannelComponent implements IComponent {
  name = 'GlobalChannelComponent';
  globalChannelService: GlobalChannelService;

  constructor(app: Application, opts: any) {
    this.globalChannelService = new GlobalChannelService(app, opts);
    app.set('globalChannelService', this.globalChannelService, true);
  }

  start(cb: Function) {
    this.globalChannelService.start(cb);
  }

  afterStart(cb: Function) {
    logger.info('GlobalChannelComponent afterStart');
    process.nextTick(cb);
  }

  stop(force: any, cb: Function) {
    this.globalChannelService.stop(force, cb);
  }

}