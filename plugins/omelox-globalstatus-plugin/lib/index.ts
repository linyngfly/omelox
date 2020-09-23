import { IPlugin } from 'omelox';
import { GlobalStatusComponent } from './components/status';
import { GlobalStatusEvent } from './events/event';

export * from './service/statusService'

class OmeloxGlobalStatusPlugin implements IPlugin {
    name = 'OmeloxGlobalStatusPlugin';
    components = [GlobalStatusComponent];
    events = [GlobalStatusEvent];
}

export default new OmeloxGlobalStatusPlugin()