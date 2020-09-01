import { IPlugin } from 'omelox';
import { KoaHttpComponent } from './lib/components/koaHttp';

class OmeloxHttpPlugin implements IPlugin {
    name = 'omeloxHttpPlugin';
    components = [KoaHttpComponent];

    filter(filter: any) {
        if (filter.before) {
            KoaHttpComponent.beforeFilters.push(filter.before.bind(filter));
        }
        if (filter.after) {
            KoaHttpComponent.afterFilters.push(filter.after.bind(filter));
        }
    }

    beforeFilter(filter: any) {
        KoaHttpComponent.beforeFilters.push(filter);
    }

    afterFilter(filter: any) {
        KoaHttpComponent.afterFilters.push(filter);
    }
}

export default new OmeloxHttpPlugin()