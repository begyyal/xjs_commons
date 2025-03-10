import { Type } from "../const/types";

export class TypeExp<T> {
    private readonly _m: any;
    constructor(t: Type.string | Type.number | Type.bigint | Type.null | Type.symbol | Type.undefined);
    constructor(t: Type.object, model: any);
    constructor(private t: Type, model?: any) { this._m = model; }
    match(o: any): o is T {
        if (typeof o !== this.t) return false;
        if (this.t !== Type.object) return true;
        const isArray = Array.isArray(o);
        if (isArray !== Array.isArray(this._m)) return false;
        
        return true;
    }
}