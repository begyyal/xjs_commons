import { T_U } from "./t-u";
import { T_UArray } from "./t-u-array";
import { T_U_File } from "./t-u-file";
import { T_UObj } from "./t-u-obj";
import { T_UString } from "./t-u-string";
import { T_UType } from "./t-u-type";

(async () => {
    T_U();
    T_UArray();
    T_UObj();
    T_UType();
    T_UString();
    T_U_File();
})().catch(e => {
    console.log(e);
    process.exit(1);
});
