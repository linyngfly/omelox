import { PlatIdentify } from "./share/constVO";

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

export interface gate_clientApi_auth_Req {
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
     */
    pay_type: number;
    /**
     * 授权渠道
     */
    auth_type: number;
    /** 授权数据 */
    auth_data: WechatAuthData | FacebookAuthData;
    /** 平台标识 */
    plat_id?: PlatIdentify;
    /** 定制选项(可选) */
    options?: any;
}