import { IPlugin } from 'omelox';
import { GlobalStatusComponent } from './components/status';

export * from './service/statusService'

class OmeloxGlobalStatusPlugin implements IPlugin {
    name = 'OmeloxGlobalStatusPlugin';
    components = [GlobalStatusComponent];

    events = [];
}

export default new OmeloxGlobalStatusPlugin()