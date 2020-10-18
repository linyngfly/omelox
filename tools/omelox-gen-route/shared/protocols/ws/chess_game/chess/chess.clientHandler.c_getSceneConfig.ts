import { ERROR } from '../../../../../app/constants/gameConst';
import { GAME_ID, SCENE_ID, BOOLEAN } from '../../../../resources/chess_game/VO/constsVO';
import { GAME_CATEGORY } from '../../../http/impl/constVO';
/**
 * 获取场景配置
 */
export interface chess_clientHandler_c_getSceneConfig_Req {
    /** 游戏id */
    gameId?: GAME_ID;
    /**
     * 押注选择
     * @TJS-type sInt32
     */
    sceneId?: SCENE_ID;
}

export interface ProtoGameSceneItem {
    /** 启用状态
     * @TJS-type sInt32
     */
    enable: BOOLEAN;
    /**
     * 场景ID
     * @TJS-type sInt32
     */
    sceneId: SCENE_ID;
    /** 底分 */
    betBase: number;
    /** 最大准入限制,0为不限制 */
    carryMax: number;
    /** 最小准入限制,0为不限制 */
    carryMin: number;
    /**
     * 场景ID
     * @TJS-type message
     */
    options?: any
}


export interface ProtoGameSceneConfig {
    list: ProtoGameSceneItem[],
    gameId: GAME_ID
}

export interface ProtoGameGlobalConfig {
    /**
     * 场景ID
     * @TJS-type message
     */
    config: any,
    gameId: GAME_ID
}

/**
 * 获取场景配置响应包
 */
export interface chess_clientHandler_c_getSceneConfig_Res_data {
    sceneConfigs: ProtoGameSceneConfig[],
    globalConfigs: ProtoGameGlobalConfig[]
}

/**
 * 获取游戏列表响应
 */
export interface chess_clientHandler_c_getGameList_Res {
    error: ERROR;
    data?: chess_clientHandler_c_getSceneConfig_Res_data;
}