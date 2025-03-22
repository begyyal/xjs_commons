import { int2array } from "../func/u";

function test_int2array(): void {
    const ary = int2array(3);
    if (ary.length !== 3 || ![0, 1, 2].every(i => ary[i] === i)) throw Error("[int2array] not working.");
    const a: any = "3";
    if (int2array(a).length != 3) throw Error("[int2array] couldn't accept parsable string correctly.");
}

export function T_U(): void {
    test_int2array();
    console.log("tests in T_U completed.");
}
