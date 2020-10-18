// 请求协议 START

import { ProtoPlayerGameBaseInfo, ProtoPushCountdown, ProtoPushRoomInfo } from './game.base';

// 请求协议 END


// 推送协议定义 START

/** 玩家进入游戏 */
export interface ProtoPlayerRankGameInfo extends ProtoPlayerGameBaseInfo {

}

export interface ProtoPushRankRoomInfo extends ProtoPushRoomInfo {
    /** 倒计时信息 */
    countdown?: ProtoPushCountdown;
    /** 庄家座位号 */
    bankerSeatId: number;
    /** 底分 */
    betBase: number;
    /** 玩家 */
    players: ProtoPlayerRankGameInfo[]
}

// 推送协议定义 END