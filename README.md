[![npm][npm-badge]][npm-url] [![CI][ci-badge]][ci-url]

# Overview
Library modules for nodejs + typescript that bundled general-purpose implementations.  
This module is very simple, therefore it has no dependencies.

# Install
```
npm i xjs-common
```
**NOTE**: The versions <= `v6.2.0` was unpublished. If you has been used these versions, please update to the version >= `v7.0.0`.

# Code example (only part)
 - Miscellaneous utilities.
```ts
import { checkPortAvailability, delay, int2array, UFile, UHttp, retry } from "xjs-common";

(async () => {
    // await 3 seconds.
    await delay(3);

    // [ 0, 1, 2, 3, 4 ]
    console.log(int2array(5));

    if (await checkPortAvailability(8080)) console.log("available.");
    else console.log("not available.");

    // true
    console.log(UHttp.isHttpSuccess(204));

    // https://aaa.com?p1=a&p2=1&p2=2
    console.log(UHttp.concatParamsWithEncoding("https://aaa.com", { p1: "a", p2: ["1", "2"] }));
    // p1=a&p2=1&p2=2
    console.log(UHttp.concatParamsWithEncoding(null, { p1: "a", p2: ["1", "2"] }));

    // runs callback with customizable retry.
    retry(async () => { }, { count: 2 });

    // concatenate file path and make directory if doesn't already exist.
    UFile.mkdir("path/to/dir");
    UFile.mkdir(["path", "to", "dir"]);
})();
```
 - Array utilities.
```ts
import { UArray } from "xjs-common";

(() => {
    // [ 1, 3, 2, 5, 4 ]
    const ary1 = UArray.distinct([1, 3, 2, 2, 1, 5, 4]);
    console.log(ary1);

    // [ 5, 4 ]
    console.log(UArray.takeOut(ary1, v => v > 3));
    // [ 1, 3, 2 ]
    console.log(ary1);

    const ary2 = [1, 2, 3];
    // true
    console.log(UArray.eq(ary1, ary2));
    // false
    console.log(UArray.eq(ary1, ary2, { sort: false }));

    const ary3 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // [ [ 1, 2, 3 ], [ 4, 5, 6 ], [ 7, 8, 9 ], [ 10 ] ]
    console.log(UArray.chop(ary3, 3));

    // randomization.
    console.log(UArray.shuffle(ary3));
    console.log(UArray.randomPick(ary3));
})();
```
 - String utilities.
```ts
import { UString } from "xjs-common";

(() => {
    // false
    console.log(UString.eq("", null));
    // true
    console.log(UString.eq("tanaka taro", "  tanaka taro  "));

    // e.g. cfNouG0P
    console.log(UString.generateRandomString(8));

    // 26
    console.log(UString.az2idx("AA"));
    // AA
    console.log(UString.idx2az(26));

    // e.g. 20250615053513
    console.log(UString.simpleTime());
    // e.g. 20250615
    console.log(UString.simpleTime({ date: getJSTDate(), unit: TimeUnit.Day }));
})();
```
 - Http client enhanced for web scraping.
```ts
import { HttpResolver, s_clientMode } from "xjs-common";

(async () => {
    const chromeMajorVersion = 134;
    // can customize logging. (default is console.)
    // const http = new HttpResolver(chromeMajorVersion, logger);
    const http = new HttpResolver(chromeMajorVersion);

    // switch tls ciphers order pattern by passing clientMode. (default is random between chrome or firefox.)
    let body = await http.get("https://begyyal.net", { mode: s_clientMode.chrome });

    // use proxy by passing the configuration.
    const proxy = { server: "proxy.sample.com", port: 8080, auth: { name: "prx", pass: "****" } }
    body = await http.post("https://begyyal.net", { proxy });

    // implicitly corresponds to cookies and redirect, and do randomization.
    body = await http.get("https://begyyal.net");

    // if you want to keep some states of requests (and suppress to randomize), it can create new context to do.
    const context = http.newContext();
    body = await context.get("https://begyyal.net/1");
    // this request sends with cookies that is set by precedent requests. 
    // in POST, payload is treated as json if it is an object.
    body = await context.post("https://begyyal.net/2", { a: "b" });
})();
```
 - Mark method as transaction.  
**NOTE**: this feature uses decorator, so requires `"experimentalDecorators": true` in tsconfig.
```ts
import { transaction, delay } from "xjs-common";

class Cls {
    constructor() { }
    // default timeout sec is 30.
    @transaction()
    async exe1(): Promise<void> {
    }
    @transaction({ timeoutSec: 3 })
    async exe2(): Promise<void> {
        await delay(10);
    }
}
(async () => {
    const cls = new Cls();
    await Promise.all([cls.exe2(), cls.exe2()]);
})().catch(e => {
    // reach here after 3 sec from second call for Cls#exe2().
    // XjsErr [Error]: [XJS] An exclusive process to execute was already running by other request.
    console.log(e);
});
```
 - Validate and crop class fields.  
**NOTE**: this feature uses decorator, so requires `"experimentalDecorators": true` in tsconfig.  
**NOTE**: some functionalities  in this feature are based on `"useDefineForClassFields": true` in tsconfig.  
this flag is true by default at the target higher than `ES2022`, [here is for more](https://www.typescriptlang.org/tsconfig/#useDefineForClassFields).
```ts
import { Type, DType, UType, UObj } from "xjs-common";

class Cls_A {
    @DType.required
    @DType.number
    id: number;
    @DType.string
    strA: string;
    @DType.recursive
    objA: Cls_B;
    p: number;
    constructor() { }
}
class Cls_B {
    @DType.array({ t: Type.number })
    aryB: number[];
    @DType.boolean
    boolB: boolean;
    q: number;
    constructor() { }
}
(() => {
    const valid_b1 = Object.assign(new Cls_B(), { aryB: [1, 2, 3], boolB: true, q: 1 });
    const valid1 = Object.assign(new Cls_A(), { id: 1, strA: "a", objA: valid_b1, p: 1 });

    // remove non decorated fields.
    const cropped = UObj.crop(valid1);
    console.log(!!cropped.id && !cropped.p && !!cropped.objA.aryB && !cropped.objA.q) // true;

    // validation. below are valid cases.
    console.log(UType.validate(valid1)); // []

    const valid2 = { id: 0 };
    console.log(UType.validate(Object.assign(new Cls_A(), valid2))); // []

    // validation. below are invalid cases.
    const invalid1 = {};
    console.log(UType.validate(Object.assign(new Cls_A(), invalid1))); // [ 'id' ]

    const invalid3 = { id: 0, strA: [], objA: valid_b1 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid3))); // [ 'strA' ]

    const invalid4 = { id: "0", strA: "a", objA: valid_b1 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid4))); // [ 'id' ]

    const invalid_b1 = Object.assign(new Cls_B(), { aryB: [1, 2, 3], boolB: 1 });
    const invalid5 = { id: 0, strA: "a", objA: invalid_b1 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid5))); // [ 'objA.boolB' ]

    const invalid_b2 = Object.assign(new Cls_B(), { aryB: ["1"], boolB: true });
    const invalid6 = { id: 0, strA: "a", objA: invalid_b2 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid6))); // [ 'objA.aryB' ]
})();
```
# Error definition
XJS throws error with `code` property which has one of the following numbers.
|code|thrown by|
|:---|:---|
|10|`func/u`|
|20|`func/u-string`|
|30|`func/u-type` (include `func/decorator/d-type`) |
|40|`func/u-file` |
|100|`func/decorator/transaction`|
|200|`prcs/http/http-resolver`|

# License
[Apache-License](./LICENSE)

[npm-url]: https://npmjs.org/package/xjs-common
[npm-badge]: https://badgen.net/npm/v/xjs-common
[ci-url]: https://github.com/begyyal/xjs_commons/actions/workflows/test.yml
[ci-badge]: https://github.com/begyyal/xjs_commons/actions/workflows/test.yml/badge.svg
