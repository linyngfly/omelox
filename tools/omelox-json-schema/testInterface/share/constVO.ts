export interface PlatIdentify {
    /** 
     * 平台编码
     */
    plat_code: string,
    /** 
     * 平台子线路编码
     */
    line_code?: string,
}

/** 游戏分类 */
export enum GAME_CATEGORY {
    NONE = 0, // 默认
    POKER = 1, // 扑克
    MJ = 2, // 麻将
    MULTI = 4, // 百人类
    ESPORTS = 8, // 街机电游
    NEW = 16, // 新游戏
    HOT = 32, // 热门游戏
    SPECIAL = 64, // 特殊分类（竞技场、俱乐部等）
}

/** 游戏级别 */
export enum GAME_GRADE {
    /** 默认 */
    NONE = 0,
    /** 推荐 */
    RECOMMEND = 1,
    /** 火爆 */
    HOT = 2,
    /** 新游戏 */
    NEW = 4,
    /** 一般 */
    COMMON = 8,
    /** 维护中 */
    MAINTENANCE = 16,
    /** 敬请期待 */
    DEV = 32,
    /** 关闭 */
    CLOSE = 64
}


/** 有效倍数 */
export interface ValidMulti {
    multi: number,
    opt: boolean,
}

/** 无效值 */
export const INVALID_NUMBER = -1;

/** 性别 */
export enum SEX {
    /** 保密 */
    SECRET = 0,
    /** 男 */
    MALE = 1,
    /** 女 */
    FEMALE = 2,
}

// 头像ID定义
export const IMG_IDS_MALE = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10'
]

// 头像id定义
export const IMG_IDS_FEMALE = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10'
]