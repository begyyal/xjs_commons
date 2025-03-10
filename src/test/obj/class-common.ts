import { Type } from "../../const/types";
import { DValidate } from "../../func/decorator/d-validate";

export class CLS_A {
    @DValidate.required
    @DValidate.number
    id: number;
    @DValidate.number
    a: number;
    @DValidate.string
    b: string;
    @DValidate.recursive
    c: CLS_B;
    constructor(
        id?: number,
        a?: number,
        b?: string,
        c?: CLS_B) {
        this.id = id;
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

export class CLS_B {
    @DValidate.required
    @DValidate.number
    id: number;
    @DValidate.required
    @DValidate.array({ t: Type.number })
    d: number[];
    @DValidate.required
    @DValidate.boolean
    e: boolean;
    constructor(
        id?: number,
        d?: number[],
        e?: boolean,
    ) {
        this.id = id;
        this.d = d;
        this.e = e;
    }
}