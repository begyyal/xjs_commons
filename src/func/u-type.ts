import { Type } from "../const/types";
import { smbl_tm, TypeMap, DValidate, TypeDesc } from "./decorator/d-validate";

export namespace UType {
    export function isDefined(v: any): boolean {
        return typeof v !== Type.undefined;
    }
    export function isEmpty(v: any): boolean {
        return v === null || typeof v === Type.undefined;
    }
    /** validate properties which attached decorators in {@link DValidate} */
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
}