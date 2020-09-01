import { randomBytes } from 'crypto';

export default class Store {
    sessions = new Map();
    __timer = new Map();

    getID(length: number) {
        return randomBytes(length).toString('hex');
    }

    async get(sid: any) {
        if (!this.sessions.has(sid)) return undefined;
        // We are decoding data coming from our Store, so, we assume it was sanitized before storing
        return JSON.parse(this.sessions.get(sid));
    }

    async set(session: any, { sid = this.getID(24), maxAge = 0 } = {}) {
        // Just a demo how to use maxAge and some cleanup
        if (this.sessions.has(sid) && this.__timer.has(sid)) {
            const __timeout = this.__timer.get(sid);
            if (__timeout) clearTimeout(__timeout);
        }

        if (maxAge) {
            this.__timer.set(sid, setTimeout(() => this.destroy(sid), maxAge));
        }
        try {
            this.sessions.set(sid, JSON.stringify(session));
        } catch (err) {
            console.log('Set session error:', err);
        }

        return sid;
    }

    destroy(sid: any) {
        this.sessions.delete(sid);
        this.__timer.delete(sid);
    }
}

