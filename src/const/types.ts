
export type IndexSignature = string | number | symbol;
export type NormalRecord = Record<IndexSignature, any>;
export type MaybeArray<T> = T | T[];
export type Loggable = { log: (msg: any) => void, warn: (msg: any) => void, error: (msg: any) => void };
export type Unique<T = number> = { id: T };
export type IdName<T = number> = { name: string } & Unique<T>;
export enum Type {
    string = "string",
    number = "number",
    bigint = "bigint",
    boolean = "boolean",
    symbol = "symbol",
    object = "object",
    undefined = "undefined",
    null = "null"
}