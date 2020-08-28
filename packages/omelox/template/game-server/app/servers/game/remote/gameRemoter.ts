import { Application, RemoterClass, FrontendSession } from 'omelox';

export default function (app: Application) {
    return new GameRemoter(app);
}

// UserRpc的命名空间自动合并
declare global {
    interface GameRpc {
        game: {
            // 一次性定义一个类自动合并到UserRpc中
            gameRemoter: RemoterClass<FrontendSession, GameRemoter>;
        };
    }
}


export class GameRemoter {
    constructor(private app: Application) {

    }

    /**
     *
     * @param username
     * @param password
     */
    public async auth(username: string, password: string) {
        return true;
    }

    // 私有方法不会加入到RPC提示里
    private async privateMethod(testarg: string, arg2: number) {

    }
}