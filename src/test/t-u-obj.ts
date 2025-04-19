import { UObj } from "../func/u-obj";
import { genCLS_A, genIF_A, genIF_B } from "./func/u";

function test1(): void {
    const a = genIF_A(1)[0];
    const b = genIF_B(1)[0];
    const assigned = UObj.assignProperties(a, b, "b", "d");
    if (!assigned.d || !assigned.a) throw Error("[UObj.assignProperties] test1 - was not assigned.");
    if (assigned.b != "bbb_b") throw Error("[UObj.assignProperties] test1 - was not overriden.");
}
function test_crop(): void {
    let a = genCLS_A(1)[0];
    let cropped = UObj.crop(a, ["id", "a", "p"]);
    if (Object.keys(cropped).length !== 3 || cropped.b || cropped.c) {
        console.error(JSON.stringify(cropped));
        throw Error("[UObj.crop] test2 - was not cropped correctly.");
    }
    a = genCLS_A(1)[0];
    cropped = UObj.crop(a, ["a", "b"], true);
    if (Object.keys(cropped).length !== 3 || cropped.a || cropped.b) {
        console.error(JSON.stringify(cropped));
        throw Error("[UObj.crop] test2 - was not cropped with exclusive mode correctly.");
    }
    a = genCLS_A(1)[0];
    cropped = UObj.crop(a);
    if (Object.keys(cropped).length !== 4 || cropped.p || cropped.c.q) {
        console.error(JSON.stringify(cropped));
        throw Error("[UObj.crop] test2 - was not cropped by d-type decorators correctly.");
    }
}

export function T_UObj(): void {
    test1();
    test_crop();
    console.log("tests in T_UObj completed.");
}
