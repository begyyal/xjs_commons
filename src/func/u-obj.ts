import { NormalRecord } from "../const/types";
import { isDefined } from "./u";

export namespace UObj {
    export function assignProperties<T extends NormalRecord, S extends NormalRecord>(t: T, s: S, ...keys: (keyof S)[]): T & Partial<S> {
        for (const k of keys) if (isDefined(s[k])) t[k] = s[k];
        return t;
    }
    export function crop<T extends NormalRecord>(o: T, ...keys: (keyof T)[]): Partial<T> {
        Object.keys(o).filter(k => !keys.includes(k)).forEach(k => delete o[k]);
        return o;
    }
}