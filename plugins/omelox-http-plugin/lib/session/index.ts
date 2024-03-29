import Store from './store';
import RedisStore from './redisStore';

export enum StoreType {
    Memory = 1,
    Redis = 2,
    MemoryCache = 3,
    Mysql = 4,
}

export default (opts: any = {}) => {
    const {
        key = 'omelox-http:session', store = new Store()
    } = opts;

    return async (ctx: any, next: any) => {
        let id = ctx.cookies.get(key, opts);

        if (!id) {
            ctx.session = {};
        } else {
            ctx.session = await store.get(id, ctx);
            // check session must be a no-null object
            if (typeof ctx.session !== 'object' || ctx.session == null) {
                ctx.session = {};
            }
        }

        const old = JSON.stringify(ctx.session);

        await next();

        // if not changed
        if (old === JSON.stringify(ctx.session)) return;

        // if is an empty object
        if (ctx.session instanceof Object && !Object.keys(ctx.session).length) {
            ctx.session = null;
        }

        // need clear old session
        if (id && !ctx.session) {
            await store.destroy(id, ctx);
            return;
        }

        // set/update session
        const sid = await store.set(ctx.session, Object.assign({}, opts, {
            sid: id
        }), ctx);

        ctx.cookies.set(key, sid, opts);
    }
}

export function genStore(type: StoreType, opts: any) {
    let store = null;
    switch (type) {
        case StoreType.Redis:
            store = new RedisStore(opts);
            break;
        case StoreType.MemoryCache:
            break;
        case StoreType.Mysql:
            break;
        default:
            break;
    }

    if (!store) {
        return;
    }

    return store;
}