import { T_UArray } from "./t-u-array";
import { T_UObj } from "./t-u-obj";

(async () => {
    T_UArray();
    T_UObj();
})().catch(e => {
    console.log(e);
    process.exit(1);
});
