import { UObj } from "../func/u-obj";
import { UType } from "../func/u-type";
import { genCLS_A, genIF_A, genIF_B } from "./func/u";

function test_assignProperties(): void {
    const a = genIF_A(1)[0];
    const b = genIF_B(1)[0];
    const assigned = UObj.assignProperties(a, b, ["b", "d"]);
    if (!assigned.d || !assigned.a) throw Error("[UObj.assignProperties] was not assigned.");
    if (assigned.b != "bbb_b") throw Error("[UObj.assignProperties] was not overriden.");
    const assign4keepOption = (keep: boolean) => {
        const ca = genCLS_A(1)[0];
        const b = { id: 1, a: 2, b: "3", c: { id: 11, d: [1], e: "bad" } };
        return UObj.assignProperties(ca, b, null, keep);
    };
    if (UType.validate(assign4keepOption(false)).length !== 0 || UType.validate(assign4keepOption(true)).length === 0)
        throw Error("[UObj.assignProperties] maybe source object was not assigned correctly with keeping d-type class.");
}
function test_crop(): void {
    let a = genCLS_A(1)[0];
    let cropped = UObj.crop(a, ["id", "a", "p"]);
    if (Object.keys(cropped).length !== 3 || cropped.b || cropped.c) {
        console.error(JSON.stringify(cropped));
        throw Error("[UObj.crop] was not cropped correctly.");
    }
    a = genCLS_A(1)[0];
    cropped = UObj.crop(a, ["a", "b"], true);
    if (Object.keys(cropped).length !== 4 || cropped.a || cropped.b) {
        console.error(JSON.stringify(cropped));
        throw Error("[UObj.crop] was not cropped with exclusive mode correctly.");
    }
    a = genCLS_A(1)[0];
    cropped = UObj.crop(a);
    if (Object.keys(cropped).length !== 5 || cropped.p || cropped.c.q) {
        console.error(JSON.stringify(cropped));
        throw Error("[UObj.crop] was not cropped by d-type decorators correctly.");
    }
}

export function T_UObj(): void {
    test_assignProperties();
    test_crop();
    console.log("tests in T_UObj completed.");
}
