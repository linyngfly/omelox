import { GAME_TYPE } from '../../../../../app/constants/gameConst';
import { BOOLEAN, GAME_ID, ROOM_ID, SCENE_ID, SEAT_ID } from '../../../../resources/chess_game/VO/constsVO';
import { GamePlayway, PlayerState } from '../../../../resources/chess_game/VO/playerVO';
// 请求协议 START

// 请求协议 END


// 推送协议定义 START

/** 玩家进入游戏 */
export interface ProtoPlayerGameBaseInfo {
    /** 用户id */
    uid: number;
    /** 座位号 */
    seatId: number;
    /** 持有金币 */
    ownGold: number;
    /** 昵称 */
    nickname: string;
    /** 头像 */
    avator: string;
    /** 性别 */
    sex: number;
    /** 登录ip */
    lastLoginIp: string;
    /** 玩家状态 */
    playerState: number;
    /** 玩家战绩id */
    reportId: string;
}


export interface ProtoPushPlayerEnter {
    /** 房间号 */
    roomId: ROOM_ID;
    /** 信息 */
    players: ProtoPlayerGameBaseInfo[];
}

/** 玩家离开 */
export interface ProtoPushPlayerLeave {
    /** 房间号 */
    roomId: ROOM_ID;
    /** 座位号 */
    seatId: SEAT_ID;
    /** 玩家状态 */
    playerState: PlayerState;
}

/** 玩家掉线 */
export interface ProtoPushPlayerOffline {
    /** 房间号 */
    roomId: ROOM_ID;
    /** 座位号 */
    seatId: SEAT_ID;
    /** 玩家状态 */
    playerState: PlayerState;
}

/** 玩家重连 */
export interface ProtoPushPlayerReconnect {
    /** 房间号 */
    roomId: ROOM_ID;
    /** 座位号 */
    seatId: SEAT_ID;
    /** 玩家状态 */
    playerState: PlayerState;
}

/** 房间信息 */
export interface ProtoPushRoomInfo {
    /** 房间号 */
    roomId: ROOM_ID;
    /** 游戏id */
    gameId: GAME_ID;
    /** 场景id */
    sceneId: SCENE_ID;
    /** 战绩id */
    reportId: string;
    /** 定制规则 */
    options: string;
    /** 游戏类型 */
    gameType: GAME_TYPE;
    /** 玩法类型 */
    playwayType: GamePlayway;
    /** 房间状态 */
    roomState: number;
}

/** 游戏倒计时 */
export interface ProtoPushCountdown {
    /**
     * @TJS-type string
     */
    gameState: string;
    /**
     * 服务器时间ms
     */
    serverTimeMS: number;
    /**
     * 倒计时开始时间
     */
    startTimeMS: number;
    /**
     * 倒计时总时间
     */
    totalTimeS: number;
    /**
     * 倒计时剩余时间
     */
    freeTimeS: number;
}

export interface ProtoPushSettlementPlayer {
    /** 座位号 */
    seatId: number;
    /** 获得金币 */
    gainGold: number;
    /** 拥有金币 */
    ownGold: number;
    /** 是否认输 */
    isDefeat: BOOLEAN;
}

// 推送协议定义 END