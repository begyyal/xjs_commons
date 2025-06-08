import { TimeUnit } from "../const/time-unit";
import { UString } from "../func/u-string";

function test_simpleTime(): void {
    const sec = UString.simpleTime();
    if (!sec.match(/^[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|[3][0-1])(0[1-9]|1\d|2[0-3])[0-5]\d[0-5]\d$/))
        throw Error(`[UString.simpleTime()] result string's format was incorrectly. ${sec}`);
    const year = UString.simpleTime({ unit: TimeUnit.Year });
    if (!year.match(/^[1-9]\d{3}$/))
        throw Error(`[UString.simpleTime()] returned inconsistent string with year time unit. ${year}`);
}

export function T_UString(): void {
    test_simpleTime();
    console.log("tests in T_UString completed.");
}
