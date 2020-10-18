import { QZNNRoomGameState } from '../../../../resources/chess_game/VO/games/pokqznnVO';
import { ProtoPushCountdown } from '../impl/game.base';

export interface game_pokqznnHandler_s_countdown extends ProtoPushCountdown {
    /**
     * @TJS-type string
     */
    gameState: QZNNRoomGameState;
}