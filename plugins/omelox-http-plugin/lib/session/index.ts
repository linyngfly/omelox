import Store from './store';

export default (opts: any = {}) => {
    const {
        key = 'koa:sess', store = new Store()
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
        if (old == JSON.stringify(ctx.session)) return;

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