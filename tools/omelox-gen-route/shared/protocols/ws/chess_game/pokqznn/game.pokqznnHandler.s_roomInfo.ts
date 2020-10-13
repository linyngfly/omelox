import { QZNNRoomGameState } from '../../../../resources/chess_game/VO/games/pokqznnVO';
import { ProtoPushRankRoomInfo } from '../impl/game.rank';

export interface game_pokqznnHandler_s_roomInfo extends ProtoPushRankRoomInfo {
    /** 游戏状态 */
    gameState: QZNNRoomGameState;
}