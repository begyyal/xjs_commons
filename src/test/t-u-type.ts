import { UType } from "../func/u-type";
import { CLS_A, CLS_B } from "./obj/class-common";

function test1(): void {
    if (!UType.isEmpty(null) || !UType.isEmpty(undefined) || UType.isEmpty(0))
        throw Error("[UType.isEmpty] test1 - not working.");
    if (UType.isDefined(undefined) || !UType.isDefined(0))
        throw Error("[UType.isDefined] test1 - not working.");
}
function test2(): void {
    const a = new CLS_A();
    if (UType.validate(a)) throw Error("[UType.validate] test2 - required decorator was not working.");
    Object.assign(a, { id: "1" });
    if (UType.validate(a)) throw Error("[UType.validate] test2 - number decorator was not working.");
    Object.assign(a, { id: 1, b: 2 });
    if (UType.validate(a)) throw Error("[UType.validate] test2 - string decorator was not working.");
    const b = new CLS_B();
    Object.assign(a, { b: "2", c: b });
    if (UType.validate(a)) throw Error("[UType.validate] test2 - recursive decorator was not working.");
    Object.assign(b, { id: 2, d: 3, e: true });
    Object.assign(a, { c: b });
    if (UType.validate(a)) throw Error("[UType.validate] test2 - array decorator was not working.");
    Object.assign(b, { d: ["3"] });
    Object.assign(a, { c: b });
    if (UType.validate(a)) throw Error("[UType.validate] test2 - array decorator was not working.");
    Object.assign(b, { d: [] });
    Object.assign(a, { c: b });
    if (!UType.validate(a)) throw Error("[UType.validate] test2 - array decorator was not working.");
    Object.assign(b, { d: [3] });
    Object.assign(a, { c: b });
    if (!UType.validate(a)) throw Error("[UType.validate] test2 - array decorator was not working.");
    Object.assign(b, { e: 123 });
    Object.assign(a, { c: b });
    if (UType.validate(a)) throw Error("[UType.validate] test2 - boolean decorator was not working.");
    Object.assign(b, { e: false });
    Object.assign(a, { c: b });
    if (!UType.validate(a)) throw Error("[UType.validate] test2 - something went wrong.");
}


export function T_UType(): void {
    test1();
    test2();
    console.log("tests in T_UType completed.");
}
