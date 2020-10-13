import { BOOLEAN } from '../../../../resources/chess_game/VO/constsVO';

/**
 * 玩家准备推送
 */
export interface game_chessRankHandler_s_playerReady {
    /** 座位号 */
    seatId: number;
}