import { ProtoPushSettlementPlayer } from '../impl/game.base';
import { ROOM_ID } from '../../../../resources/chess_game/VO/constsVO';

/**
 * 结算
 */
export interface game_pokqznnHandler_s_settlement {
    /** 牌局状态 */
    status: number;
    /** 房间号 */
    roomId: ROOM_ID;
    /** 信息 */
    info: ProtoPushSettlementPlayer[];
}