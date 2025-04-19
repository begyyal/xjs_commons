import { NormalRecord } from "../const/types";
import { UType } from "./u-type";

export namespace UObj {
    export function assignProperties<T extends NormalRecord, S extends NormalRecord>(t: T, s: S, ...keys: (keyof S)[]): T & Partial<S> {
        for (const k of keys) if (UType.isDefined(s[k])) t[k] = s[k];
        return t;
    }
    export function crop<T extends NormalRecord>(o: T, keys: (keyof T)[], exclusive?: boolean): Partial<T> {
        Object.keys(o).filter(k => !!exclusive === keys.includes(k)).forEach(k => delete o[k]);
        return o;
    }
}