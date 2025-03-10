import { T_UArray } from "./t-u-array";
import { T_UObj } from "./t-u-obj";
import { T_UType } from "./t-u-type";

(async () => {
    T_UArray();
    T_UObj();
    T_UType();
})().catch(e => {
    console.log(e);
    process.exit(1);
});
