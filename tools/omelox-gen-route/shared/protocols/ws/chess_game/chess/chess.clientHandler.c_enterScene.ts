import { GAME_ID, SCENE_ID, ROOM_ID } from '../../../../resources/chess_game/VO/constsVO';
/**
 * 进入游戏请求包
 */
export interface chess_clientHandler_c_enterScene_Req {
    /** 游戏id */
    gameId: GAME_ID;
    /** 场景id */
    sceneId: SCENE_ID;
    /** 房间id */
    roomId?: ROOM_ID;
    /**
     * 选项定制
     * @TJS-type message
     */
    options?: any;
}