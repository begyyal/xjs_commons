import { Loggable } from "../const/types";
import { delay, int2array, retry } from "../func/u";

function test_int2array(): void {
    const ary = int2array(3);
    if (ary.length !== 3 || ![0, 1, 2].every(i => ary[i] === i)) throw Error("[int2array] not working.");
    const a: any = "3";
    if (int2array(a).length != 3) throw Error("[int2array] couldn't accept parsable string correctly.");
}
async function test_retry(): Promise<void> {
    const emptyLogger: Loggable = { log: () => { }, warn: () => { }, error: () => { } };
    let ret = null, a = 0, errorCount = 2;
    let cb = () => { a += 1; return a; };
    if (retry(cb, 2, emptyLogger) !== 1) throw Error("[retry] result value from callback was not returned correctly.");
    cb = () => { a += 1; if (a <= errorCount) throw Error(); return a; };
    ret = null, a = 0;
    try { ret = retry(cb, 2, emptyLogger); } catch { }
    if (ret !== 3) throw Error("[retry] callback was not retried by default retryable count correctly.");
    ret = null, a = 0;
    try { ret = retry(cb, 1, emptyLogger); } catch { /** pass here is correct. */ }
    if (ret != null) throw Error("[retry] specified retry count was not working.");
    let cbAsync = async () => { a += 1; await delay(0); if (a <= errorCount) throw Error(); return a; };
    ret = null, a = 0;
    try { ret = await retry(cbAsync, 2, emptyLogger); } catch { }
    if (ret !== 3) throw Error(`[retry] async callback was not working. ret => ${ret}`);
}

export async function T_U(): Promise<void> {
    test_int2array();
    await test_retry();
    console.log("tests in T_U completed.");
}
