import { Type } from "../../const/types";
import { DType } from "../../func/decorator/d-type";

export class CLS_A {
    @DType.required
    @DType.number
    id: number;
    @DType.number
    a: number;
    @DType.string
    b: string;
    @DType.recursive
    c: CLS_B;
    p: any;
    constructor(
        id?: number,
        a?: number,
        b?: string,
        c?: CLS_B,
        p?: any) {
        this.id = id;
        this.a = a;
        this.b = b;
        this.c = c;
        this.p = p;
    }
}

export class CLS_B {
    @DType.required
    @DType.number
    id: number;
    @DType.required
    @DType.array({ t: Type.number })
    d: number[];
    @DType.required
    @DType.boolean
    e: boolean;
    q: any;
    constructor(
        id?: number,
        d?: number[],
        e?: boolean,
        q?: any
    ) {
        this.id = id;
        this.d = d;
        this.e = e;
        this.q = q;
    }
}