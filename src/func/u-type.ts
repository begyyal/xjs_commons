import { Type } from "../const/types";
import { smbl_tm, TypeMap, DType, TypeDesc } from "./decorator/d-type";

export namespace UType {
    export function isDefined(v: any): boolean {
        return typeof v !== Type.undefined;
    }
    export function isEmpty(v: any): boolean {
        return v === null || typeof v === Type.undefined;
    }
    export function isString(v: any): v is string { return typeof v === Type.string; }
    export function isNumber(v: any): v is number { return typeof v === Type.number; }
    export function isBigint(v: any): v is bigint { return typeof v === Type.bigint; }
    export function isBoolean(v: any): v is boolean { return typeof v === Type.boolean; }
    export function isSymbol(v: any): v is symbol { return typeof v === Type.symbol; }
    export function isObject(v: any): v is object { return typeof v === Type.object; }
    /** validate properties which attached decorators in {@link DType} */
    export function validate(o: any): boolean {
        return !o[smbl_tm] || Object.entries(o[smbl_tm] as TypeMap)
            .every(e => validateProp(o[e[0]], e[1]));
    }
    function validateProp(prop: any, td: TypeDesc): boolean {
        if (isEmpty(prop)) return !td.req;
        if (td.t && typeof prop !== td.t) return false;
        if (td.ary) return Array.isArray(prop) && (!td.ary || prop.every(e => validateProp(e, td.ary)));
        if (td.rec) return validate(prop);
        return true;
    }
    export function takeAsArray<T>(v: T | T[]): T[] {
        return Array.isArray(v) ? v : [v];
    }
}