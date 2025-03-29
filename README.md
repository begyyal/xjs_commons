[![CI](https://github.com/begyyal/xjs_commons/actions/workflows/test.yml/badge.svg)](https://github.com/begyyal/xjs_commons/actions/workflows/test.yml)

Available to `npm i xjs-common`.

# Overview
Library modules for nodejs that bundled general-purpose implementations.  
This module is very simple, therefore it has no dependencies.

# Code example (only part)
 - Miscellaneous utilities.
```ts
import { checkPortAvailability, delay, int2array } from "../func/u";
import { UFile } from "../func/u-file";
import { UHttp } from "../func/u-http";

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

    // concatenate file path and make directory if doesn't already exist.
    UFile.mkdir("path/to/dir");
    UFile.mkdir(["path", "to", "dir"]);

    // ignore if f1 is not file or doesn't exist.
    UFile.mv("path/to/f1", "path/to/f2");
    UFile.mv(["path", "to", "f1"], ["path", "to", "f2"]);
})();
```
 - Array utilities.
```ts
import { UArray } from "../func/u-array";

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
})();
```
 - String utilities.
```ts
import { UString } from "../func/u-string";

(() => {
    // true
    console.log(UString.eq("", "   "));
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

    // e.g. 20250310
    console.log(UString.simpleDate2day());
    console.log(UString.simpleDate2day(new Date()));
})();
```
 - Mark method as transaction.  
**NOTE**: this feature uses decorator, so requires `"experimentalDecorators": true` in tsconfig.
```ts
import { transaction } from "../func/decorator/transaction";
import { delay } from "../func/u";

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
 - Validate class fields.  
**NOTE**: this feature uses decorator, so requires `"experimentalDecorators": true` in tsconfig.
```ts
import { Type } from "../const/types";
import { DValidate } from "../func/decorator/d-validate";
import { UType } from "../func/u-type";

class Cls_A {
    @DValidate.required
    @DValidate.number
    id: number;
    @DValidate.string
    strA: string;
    @DValidate.recursive
    objA: Cls_B;
    constructor() { }
}
class Cls_B {
    @DValidate.array({ t: Type.number })
    aryB: number[];
    @DValidate.boolean
    boolB: boolean;
    constructor() { }
}
(() => {
    // ===> below are valid cases.
    const valid_b1 = Object.assign(new Cls_B(), { aryB: [1, 2, 3], boolB: true });
    const valid1 = { id: 0, strA: "a", objA: valid_b1 };
    console.log(UType.validate(Object.assign(new Cls_A(), valid1))); // true

    const valid2 = { id: 0 };
    console.log(UType.validate(Object.assign(new Cls_A(), valid2))); // true

    // ===> below are invalid cases.
    const invalid1 = {};
    console.log(UType.validate(Object.assign(new Cls_A(), invalid1))); // false

    const invalid3 = { id: 0, strA: [], objA: valid_b1 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid3))); // false

    const invalid4 = { id: "0", strA: "a", objA: valid_b1 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid4))); // false

    const invalid_b1 = Object.assign(new Cls_B(), { aryB: [1, 2, 3], boolB: 1 });
    const invalid5 = { id: 0, strA: "a", objA: invalid_b1 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid5))); // false

    const invalid_b2 = Object.assign(new Cls_B(), { aryB: ["1"], boolB: true });
    const invalid6 = { id: 0, strA: "a", objA: invalid_b2 };
    console.log(UType.validate(Object.assign(new Cls_A(), invalid6))); // false
})();
```
 - Http client.
```ts
import { HttpResolver, s_clientMode } from "../prcs/http-resolver";

(async () => {
    const chromeMajorVersion = 131;

    // can customize logging. (default is console.)
    // const http = new HttpResolver(chromeMajorVersion, logger);
    const http = new HttpResolver(chromeMajorVersion);

    // switch tls ciphers order pattern by passing clientMode. (default is random between chrome or firefox.)
    let body = await http.get("https://books.toscrape.com", { mode: s_clientMode.firefox });

    // use proxy by passing the configuration.
    const proxy = { server: "proxy.sample.com", port: 8080, auth: { name: "prx", pass: "****" } }
    body = await http.get("https://books.toscrape.com", { proxy });

    // implicitly corresponds to cookies and redirect.
    body = await http.get("https://books.toscrape.com");
    console.log(body);
})();
```

## Error definition
XJS throws error with `code` property which has one of the following numbers.
|code|thrown by|
|:---|:---|
|10|`func/u`|
|20|`func/u-string`|
|30|`func/u-type` (include `func/decorator/d-validate`) |
|100|`func/decorator/transaction`|
|200|`prcs/http-resolver`|
