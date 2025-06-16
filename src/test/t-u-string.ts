import { TimeUnit } from "../const/time-unit";
import { UString } from "../func/u-string";

function test_timeFormatValidations(): void {
    if (!UString.is_yyyyMMddhhmmss("20251231235959"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyyMMddhhmmss("20251231246060"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
    if (!UString.is_yyyyMMddhhmm("202512312359"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyyMMddhhmm("202512312460"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
    if (!UString.is_yyyyMMddhh("2025123123"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyyMMddhh("2025123124"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
    if (!UString.is_yyyyMMdd("20251231"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyyMMdd("20251200"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
    if (!UString.is_yyyyMM("202512"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyyMM("202500"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
    if (!UString.is_yyyy("2025"))
        throw Error("[UString.is_yyyyMMddhhmmss] returns false despite of correct format.");
    if (UString.is_yyyy("0025"))
        throw Error("[UString.is_yyyyMMddhhmmss] false positive.");
}
function test_simpleTime(): void {
    const sec = UString.simpleTime();
    if (!UString.is_yyyyMMddhhmmss(sec))
        throw Error(`[UString.simpleTime()] result string's format was incorrectly. ${sec}`);
    const year = UString.simpleTime({ unit: TimeUnit.Year });
    if (!UString.is_yyyy(year))
        throw Error(`[UString.simpleTime()] returned inconsistent string with year time unit. ${year}`);
}

export function T_UString(): void {
    test_timeFormatValidations();
    test_simpleTime();
    console.log("tests in T_UString completed.");
}
