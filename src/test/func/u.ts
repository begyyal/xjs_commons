import { int2array } from "../../func/u";
import { IF_A, IF_B } from "../obj/if-common";

export function genIF_A(len: number): IF_A[] {
    return int2array(len).map(i => ({ id: i, a: "aaa", b: "bbb", c: "ccc" }));
}
export function genIF_B(len: number): IF_B[] {
    return int2array(len).map(i => ({ id: i, b: "bbb_b", c: "ccc_b", d: i + len }));
}
