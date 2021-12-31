import {Application} from 'omelox';
import {FrontendSession} from 'omelox';

export default function (app: Application) {
    return new EntryHandler(app);
}

export class EntryHandler {
    constructor(private app: Application) {
    }


    /**
     * New client entry chat server.
     *
     * @param  {Object}   msg     request message
     * @param  {Object}   session current session object
     */
    async enter(msg: { rid: string, username: string }, session: FrontendSession) {
        let self = this;
        let rid = msg.rid;
        let uid = msg.username + '*' + rid;
        let sessionService = self.app.get('sessionService');

        // duplicate log in
        if (!!sessionService.getByUid(uid)) {
            return {
                code: 500,
                error: true
            };
        }

        await session.abind(uid);
        session.set('rid', rid);
        session.push('rid', function (err) {
            if (err) {
                console.error('set rid for session service failed! error is : %j', err.stack);
            }
        });
        session.on('closed', this.onUserLeave.bind(this));

        // put user into channel
        let users = await self.app.rpc.chat.chatRemote.add.route(session)(uid, self.app.get('serverId'), rid, true);

        // test remoter
        self.app.rpc.chat1.notifyRemote.notifyMethod.to("chat-server-1")('11', '22', '33')
        self.app.rpc.chat2.anotherName.zzzMethod.to(null)('aa', 'bb', 'cc') 
        return {
            users: users
        };
    }

    /**
     * User log out handler
     *
     * @param {Object} app current application
     * @param {Object} session current session object
     *
     */
    onUserLeave(session: FrontendSession) {
        if (!session || !session.uid) {
            return;
        }
        this.app.rpc.chat.chatRemote.kick.route(session, true)(session.uid, this.app.get('serverId'), session.get('rid'));
    }
}