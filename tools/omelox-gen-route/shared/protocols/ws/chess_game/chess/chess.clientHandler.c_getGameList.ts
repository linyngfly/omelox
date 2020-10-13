import { GAME_ID, GAME_CATEGORY, GAME_GRADE, BOOLEAN } from '../../../../resources/chess_game/VO/constsVO';
import { ERROR } from '../../../common';
export interface ProtoGameListItem {
    /** 游戏名称 */
    gameName: string;
    /** 游戏ID */
    gameId: GAME_ID;
    /** 是否使用游戏分组 */
    groupUse: BOOLEAN;
    /** 分组ID */
    groupId: string;
    /** 分组中包含游戏id */
    groupGameIds?: GAME_ID[];
    /** 游戏分类 */
    category: GAME_CATEGORY;
    /** 游戏等级 */
    grade: GAME_GRADE;
    /** 排序序号 */
    index: number;
    /** 基础人数是否显示 */
    baseCountShow: BOOLEAN;
    /** 在线人数 */
    onlineCount?: number;
}

export interface chess_clientHandler_c_getGameList_Res_data {
    list: ProtoGameListItem[]
}

/**
 * 获取游戏列表响应
 */
export interface chess_clientHandler_c_getGameList_Res {
    error: ERROR;
    data?: chess_clientHandler_c_getGameList_Res_data;
}