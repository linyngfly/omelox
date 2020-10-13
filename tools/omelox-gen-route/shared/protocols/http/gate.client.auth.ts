import { CURRENCY } from '../../resources/currency';
import { LANGUAGE } from '../../resources/languages';
import { PlatIdentify, SEX } from '../../resources/chess_game/VO/constsVO';
import { PayType } from '../common';
// import { PlatIdentify, SEX } from './impl/constVO';

export interface InnerAuthData {
    /**
     * 昵称
     */
    nickname?: string;
    /**
     * 玩家账号
     */
    account_id: string;
    /**
     * 头像
     */
    avator?: string;
    /**
     * 密码
     */
    password: string;
    /**
     * 性别
     * @TJS-type number
     */
    sex?: SEX;
    /**
     * 语言
     * @TJS-type string
     */
    language?: LANGUAGE;
    /**
     * 语言
     * @TJS-type string
     */
    currency?: CURRENCY;
    /**
     * 国家
     */
    country?: string;
    /**
     * 城市
     */
    city?: string;
}

export interface AgentAuthData {
    /**
     * 玩家账号
     */
    account_id: string,
    /**
     * 密码
     */
    game_code: string,
}

/**
 * 微信授权数据
 */
export interface WechatAuthData {
    /**
     * 授权code
     */
    code: string,
}

/**
 * facebook授权数据
 */
export interface FacebookAuthData {
    /**
     * facebook授权token
     */
    access_token: string,
}

export interface gate_client_auth_Req {
    // /**
    //  * Specify individual fields in items.
    //  *
    //  * @minimum 0
    //  * @maximum 100
    //  */
    // token: number;
    // msg?: string;
    // duplicateIgg?: IGG
    // sharewithServerused?: GGG

    /**
     * 支付类型
     * @TJS-type string
     */
    pay_type: PayType;
    /**
     * 授权渠道
     */
    auth_type: number;
    /**
     * 平台标识
     */
    plat_id: PlatIdentify;
    /**
     * 授权数据
     */
    auth_data: InnerAuthData | AgentAuthData | WechatAuthData | FacebookAuthData;
    /**
     * 定制选项(可选)
     */
    options?: any;
}



export interface UserInfo {
    id: number;
    nickname: string;
    sex: SEX;
    avator: string;
    amount: number;
    token: string;
}

export interface ConnectInfo {

}

export interface gate_client_auth_Res {
    /**
     * 用户基本信息
     */
    user_info: UserInfo;
    /**
     * 服务器版本
     */
    version: string;
    /**
     * 连接服务器
     */
    connector: string;
}