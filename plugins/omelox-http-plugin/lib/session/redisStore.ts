// import Redis from 'ioredis';
// import Store from './store';

// class RedisStore extends Store {
//     redis: any = null;
//     constructor(opts) {
//         super();
//         this.redis = new Redis({
//             port: opts.port,
//             host: opts.host,
//             password: opts.auth ? opts.password : null,
//             db: opts.db
//         });
//     }

//     async get(sid, ctx) {
//         let data = await this.redis.get(`SESSION:${sid}`);
//         return JSON.parse(data);
//     }

//     async set(session, {
//         sid = this.getID(24),
//         maxAge = 1000000
//     } = {}, ctx) {
//         try {
//             // Use redis set EX to automatically drop expired sessions
//             await this.redis.set(`SESSION:${sid}`, JSON.stringify(session), 'EX', maxAge / 1000);
//         } catch (e) { }
//         return sid;
//     }

//     async destroy(sid, ctx) {
//         return await this.redis.del(`SESSION:${sid}`);
//     }
// }

// module.exports = RedisStore;