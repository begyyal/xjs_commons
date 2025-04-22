import { Type } from "../../const/types";
import { XjsErr } from "../../obj/xjs-err";
import { UType } from "../u-type";
import { UObj } from "../u-obj";

const s_errCode = 30;

export const smbl_tm = Symbol.for("xjs:typeMap");
export interface TypeDesc {
    t?: Type;
    req?: boolean;
    ary?: TypeDesc;
    rec?: boolean;
}
export interface TypeMap { [k: string]: TypeDesc }
/** 
 * decorators to be validated by {@link UType.validate},
 * and to be cropped by {@link UObj.crop}.
 */
export namespace DType {
    export function string(target: Object, propKey: string): void {
        setTypeDesc(target, propKey, Type.string);
    }
    export function number(target: Object, propKey: string): void {
        setTypeDesc(target, propKey, Type.number);
    }
    export function boolean(target: Object, propKey: string): void {
        setTypeDesc(target, propKey, Type.boolean);
    }
    function setTypeDesc(target: Object, propKey: string, t: Type): void {
        setDesc(target, propKey, (td) => {
            if (td.t) throw new XjsErr(s_errCode, "decorator to express type is duplicate.");
            td.t = t;
        });
    }
    export function required(target: Object, propKey: string): void {
        setDesc(target, propKey, (td) => td.req = true);
    }
    export function array(elmDesc: TypeDesc = {}): (target: Object, propKey: string) => void {
        return (target: Object, propKey: string) => setDesc(target, propKey, (td) => td.ary = elmDesc);
    }
    export function recursive(target: Object, propKey: string): void {
        setDesc(target, propKey, (td) => td.rec = true);
    }
    export function keep(target: Object, propKey: string): void {
        setDesc(target, propKey, (_) => { });
    }
    function setDesc(target: Object, propKey: string, setter: (td: TypeDesc) => void): void {
        const map: TypeMap = target[smbl_tm] ?? {};
        map[propKey] ??= { t: null, req: false, rec: false, ary: null };
        const td = map[propKey];
        setter(td);
        let ex1 = null, ex2 = null;
        if (td.t && td.rec) { ex1 = "type"; ex2 = "recursive flag"; }
        if (td.t && td.ary) { ex1 = "type"; ex2 = "array"; }
        if (td.ary && td.rec) { ex1 = "array"; ex2 = "recursive flag"; }
        if (ex1 && ex2) throw new XjsErr(s_errCode, `decorator to express ${ex1} and ${ex2} are exclusive.`);
        Object.defineProperty(target, smbl_tm, { value: map });
    }
}
