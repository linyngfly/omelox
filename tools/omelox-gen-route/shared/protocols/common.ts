export interface ERROR {
    /**
     * @TJS-type int32
     */
    code: number;
    msg: string;
    detail?: string;
}

// 支付渠道定义
export enum PayType {
    /** 转入转出 */
    AgencyInOut = 'INOUT',
    /** BL钱包 */
    BLWallet = 'BL',
    /** CQ钱包 */
    CQWallet = 'CQ',
}

// 授权渠道定义
export enum AuthType {
    /** 内部渠道 */
    Inner = 100,
    /** 代理授权渠道 */
    Agency = 200,
    /** 代理BL钱包渠道 */
    AgencyBLWallet = 201,
    /** 代理CQ钱包渠道 */
    AgencyCQWallet = 202,
    /** 微信渠道 */
    Wechat = 300,
    /** facebook渠道 */
    Facebook = 400,
    /** google渠道 */
    Google = 500,
};