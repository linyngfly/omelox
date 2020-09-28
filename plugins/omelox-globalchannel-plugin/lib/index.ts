import { IPlugin } from 'omelox';
import { GlobalChannelComponent } from './components/globalChannel';

export * from './service/globalChannelService'

class OmeloxGlobalChannelPlugin implements IPlugin {
    name = 'OmeloxGlobalChannelPlugin';
    components = [GlobalChannelComponent];
}

export default new OmeloxGlobalChannelPlugin()