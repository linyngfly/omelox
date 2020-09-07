// duplicate IGG name
import { GGG } from "./share/myrank";

interface IGG {
  /**
   * ================.
   * @TJS-type array
   * @items.type integer
   * @items.minimum 0
   * @items.maximum 100
   */
  ggenv: number[];
  /**
   * @minimum 0
   * @maximum 100
   */
  zz: number;
}

export interface rank_playerHandler_beginGame_Req {
  /**
   * Specify individual fields in items.
   *
   * @minimum 0
   * @maximum 100
   */
  token: number;
  msg?: string;
  duplicateIgg?: IGG
  sharewithServerused?: GGG
}

export interface rank_playerHandler_beginGame_Res {
  /**
   * @TJS-type number
   */
  code?: number;
  msg?: string;
  /**
   * @TJS-type number
   */
  currank: number;
}
