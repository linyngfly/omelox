import { ERROR } from '../common';

export interface connector_clientHandler_c_login_Req {
  /** 会话 */
  token: string;
}

export interface connector_clientHandler_c_login_Res_data {
  version: string;
}

export interface connector_clientHandler_c_login_Res {
  error: ERROR;
  data?: connector_clientHandler_c_login_Res_data;
}
