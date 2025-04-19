import { UObj } from "../func/u-obj";
import { genIF_A, genIF_B } from "./func/u";

function test1(): void {
    const a = genIF_A(1)[0];
    const b = genIF_B(1)[0];
    const assigned = UObj.assignProperties(a, b, "b", "d");
    if (!assigned.d || !assigned.a) throw Error("[UObj.assignProperties] test1 - was not assigned.");
    if (assigned.b != "bbb_b") throw Error("[UObj.assignProperties] test1 - was not overriden.");
}
function test_crop(): void {
    let a = genIF_A(1)[0];
    let cropped = UObj.crop(a, ["id", "a"]);
    if (Object.keys(cropped).length !== 2 || cropped.b || cropped.c)
        throw Error("[UObj.crop] test2 - was not cropped.");
    a = genIF_A(1)[0];
    cropped = UObj.crop(a, ["a", "b"], true);
    if (Object.keys(cropped).length !== 2 || cropped.a || cropped.b)
        throw Error("[UObj.crop] test2 - was not cropped with exclusive mode.");
}

export function T_UObj(): void {
    test1();
    test_crop();
    console.log("tests in T_UObj completed.");
}
