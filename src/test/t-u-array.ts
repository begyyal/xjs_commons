import { int2array } from "../func/u";
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
    const t2 = Date.now() - t;
    if (t2 > 1000) throw Error(`[UArray.distinct] test1 - too slow (${t2 / 1000}sec)`);
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
    const t2 = Date.now() - t;
    if (t2 > 3000) throw Error(`[UArray.distinct] test2 - too slow (${t2 / 1000}sec)`);
    if (rcds.length !== before) throw Error(`[UArray.distinct] test2 - mismatch lengh | ${before} -> ${rcds.length}`);
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
function test_eq(): void {
    const a = [1, 2, 3], b = [1, 3, 2], c = [];
    if (!UArray.eq(a, a) || !UArray.eq(null, undefined) || UArray.eq(a, c)) throw Error("[UArray.eq] not working.");
    if (!UArray.eq(a, b)) throw Error("[UArray.eq] not working, maybe default sort flag were off.");
    if (!UArray.eq(a, ["1", "2", "3"], { useStrictEqual: false }))
        throw Error("[UArray.eq] elements were compared by strict equal in spite of useStrictEqual is false.");
    if (UArray.eq(a, b, { sort: false }))
        throw Error("[UArray.eq] elements were sorted in spite of sort flag is false.");
}
function test_randomPick(): void {
    const a = [1, 2, 3];
    const r = UArray.randomPick(a);
    if (!r) throw Error("[UArray.randomPick] no element returned.");
    if (a.length !== 2) throw Error("[UArray.randomPick] a picked element remains in the array.");
    UArray.randomPick(a, false);
    if (a.length !== 2) throw Error("[UArray.randomPick] a picked element was taken out from the array.");
}
function test_shuffle(): void {
    const len = 10000;
    const a = int2array(len);
    const r = UArray.shuffle(a);
    if (!UArray.eq(a, int2array(len), { sort: false })) throw Error("[UArray.shuffle] the elements mutated.");
    if (UArray.eq(r, a, { sort: false }) || int2array(3).some(_ => UArray.eq(r, UArray.shuffle(a), { sort: false })))
        throw Error("[UArray.shuffle] not working.");
}

export function T_UArray(): void {
    test1();
    test2();
    test3();
    test4();
    test5();
    test_eq();
    test_randomPick();
    test_shuffle();
    console.log("tests in T_UArray completed.");
}