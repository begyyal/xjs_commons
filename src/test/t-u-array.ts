import { UArray } from "../func/u-array";
import { genIF_A } from "./func/u";
import { IF_A } from "./obj/if-common";

function test1(): void {
    let rcds: IF_A[] = genIF_A(30000);
    const before = rcds.length;
    rcds.push(...genIF_A(30000));
    rcds[0].a = "z";
    const t = Date.now();
    rcds = UArray.distinct(rcds, { k: "id" });
    if (Date.now() - t > 1000) throw Error("[UArray.distinct] test1 - too slow");
    if (rcds.length !== before) throw Error(`[UArray.distinct] test1 - mismatch lengh | ${before} -> ${rcds.length}`);
    if (rcds.find(r => r.id === 0).a !== "z") throw Error("[UArray.distinct] test1 - couldn't take first");
}
function test2(): void {
    let rcds: IF_A[] = genIF_A(30000);
    const before = rcds.length;
    rcds.push(...genIF_A(30000));
    rcds[0].a = "z";
    const t = Date.now();
    rcds = UArray.distinct(rcds, { predicate: (v1, v2) => v1.id === v2.id });
    if (Date.now() - t > 2000) throw Error("[UArray.distinct] test2 - too slow");
    if (rcds.length !== before) throw Error(`[UArray.distinct] test1 - mismatch lengh | ${before} -> ${rcds.length}`);
    if (rcds.find(r => r.id === 0).a !== "z") throw Error("[UArray.distinct] test2 - couldn't take first");
}
function test3(): void {
    let rcds: IF_A[] = genIF_A(3);
    rcds.push(...genIF_A(3));
    rcds[0].a = "z";
    rcds = UArray.distinct(rcds, { predicate: (v1, v2) => v1.id === v2.id, takeLast: true });
    if (UArray.eq(genIF_A(3), rcds)) throw Error("[UArray.distinct] test3 - couldn't take last");
}
function test4(): void {
    let rcds: IF_A[] = genIF_A(3);
    rcds.push(...genIF_A(3));
    rcds[0].a = "z";
    rcds = UArray.distinct(rcds, { k: "id", takeLast: true });
    if (UArray.eq(genIF_A(3), rcds)) throw Error("[UArray.distinct] test4 - couldn't take last");
}
function test5(): void {
    const a = [1, 2, 4, 1, 2, 3, 6, 7, 3, 4, 6, 9, 2, 5, 0, 8];
    const b = UArray.distinct(a);
    if (b.length !== 10) throw Error("[UArray.distinct] test5 - duplicated");
    const c = UArray.distinct(a.map(n => n.toString()));
    if (c.length !== 10) throw Error("[UArray.distinct] test5 - duplicated");
}

export function T_UArray(): void {
    test1();
    test2();
    test3();
    test4();
    test5();
    console.log("tests in T_UArray completed.");
}