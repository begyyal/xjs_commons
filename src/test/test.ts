import { T_UArray } from "./t-u-array";

(async () => {
    T_UArray();
})().catch(e => {
    console.log(e);
    process.exit(1);
});
