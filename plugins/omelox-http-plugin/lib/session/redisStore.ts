import * as redis from 'redis';
import Store from './store';
import * as path from 'path';
import { promisify } from 'util';
import { getLogger } from 'omelox-logger';
const logger = getLogger('omelox', path.basename(__filename));

export default class RedisStore extends Store {
    redisClient: redis.RedisClient = null;
    getAsync: any = null;
    setAsync: any = null;
    delAsync: any = null;

    constructor(opts: any) {
        super();

        opts.password = opts.auth ? opts.password : null;
        opts.prefix = opts.prefix || 'common:http';

        this.redisClient = redis.createClient(opts);

        this.redisClient.on('error', function (error: any) {
            logger.error('http session redis connect error ', error);
        });

        this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
        this.setAsync = promisify(this.redisClient.set).bind(this.redisClient);
        this.delAsync = promisify(this.redisClient.del).bind(this.redisClient);
    }

    async get(sid: any, ctx?: any) {
        let data = await this.getAsync.get(`SESSIONID:${sid}`);
        return JSON.parse(data);
    }

    async set(session: any, {
        sid = this.getID(64),
        maxAge = 1000000
    } = {}, ctx?: any) {
        try {
            // Use redis set EX to automatically drop expired sessions
            await this.setAsync.set(`SESSIONID:${sid}`, JSON.stringify(session), 'EX');
            this.redisClient.expire(`SESSIONID:${sid}`, maxAge / 1000);
        } catch (e) { }
        return sid;
    }

    async destroy(sid: any, ctx?: any) {
        return await this.setAsync.del(`SESSIONID:${sid}`);
    }
}
