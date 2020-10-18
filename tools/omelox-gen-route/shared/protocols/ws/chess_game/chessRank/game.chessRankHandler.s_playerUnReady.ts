import { BOOLEAN } from '../../../../resources/chess_game/VO/constsVO';

/**
 * 玩家取消准备推送
 */
export interface game_chessRankHandler_s_playerUnReady {
    /** 座位号 */
    seatId: number;
}