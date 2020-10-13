import { GGG, MyRank } from './impl/myrank';


interface IGG {
    ggenv?: string[];
}

interface IFF {
    ffname: string;
    aa?: IGG[];
}

enum EnumTest {
    AA,
    BB,
    CC
}

export interface onRank extends IFF, IGG {
    /**
     * The float of the nowplayers.
     *
     * @additionalProperties number
     * @TJS-type array
     */
    normalArr: number[];
    /**
     * @TJS-type number
     */
    enum: EnumTest;
    normalStrArr: string[];
    innerGGG?: GGG;
    ranks: MyRank[];
    rk?: MyRank;
    val?: number;
}