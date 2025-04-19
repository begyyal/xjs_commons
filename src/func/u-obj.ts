import { NormalRecord } from "../const/types";
import { DType, smbl_tm, TypeMap } from "./decorator/d-type";
import { UType } from "./u-type";

export namespace UObj {
    export function assignProperties<T extends NormalRecord, S extends NormalRecord>(t: T, s: S, ...keys: (keyof S)[]): T & Partial<S> {
        for (const k of keys) if (UType.isDefined(s[k])) t[k] = s[k];
        return t;
    }
    /**
     * crop properties of the object. the properties is removed with `delete` operator.
     * @param o object which properties is removed.
     * @param keys property names to be remained. if omit this, it removes the properties other than properties decorated {@link DType}.
     * @param exclusive if true, it removes `keys` instead of remaining it.
     */
    export function crop<T extends NormalRecord>(o: T, keys?: (keyof T)[], exclusive?: boolean): Partial<T> {
        if (!keys && !o[smbl_tm]) return {};
        const _keys = keys ?? Object.keys(o[smbl_tm]);
        Object.keys(o).filter(k => {
            if (!keys && (o[smbl_tm] as TypeMap)?.[k]?.rec) crop(o[k]);
            return !!exclusive === _keys.includes(k);
        }).forEach(k => delete o[k]);
        return o;
    }
    export function clone<T extends NormalRecord>(o: T): T {
        return JSON.parse(JSON.stringify(o));
    }
}