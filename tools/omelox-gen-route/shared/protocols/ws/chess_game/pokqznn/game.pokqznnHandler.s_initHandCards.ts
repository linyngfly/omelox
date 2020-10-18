import { QZNNPattern } from '../../../../resources/chess_game/VO/games/pokqznnVO';

/**
 * 发牌
 */
export interface game_pokqznnHandler_s_initHandCards {
    /** 座位号 */
    seatId: number;
    /**
     * 手牌
     * @additionalProperties uInt32
     * @TJS-type array
     */
    handCards: number[];
    /**
     * 牌型
     * @TJS-type uInt32
     */
    pattern: QZNNPattern;
}