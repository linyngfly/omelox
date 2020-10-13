import { BOOLEAN } from '../../../../resources/chess_game/VO/constsVO';

/**
 * 玩家撤销准备
 */
export interface game_chessRankHandler_c_playerUnReady_Req {
    /** 是否是托管操作 */
    isTrustee?: BOOLEAN;
}