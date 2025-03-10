
export type IndexSignature = string | number | symbol;
export type NormalRecord = Record<IndexSignature, any>;
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
export enum Gender {
    Male,
    Female
}
export enum HttpMethod {
    Get,
    Put,
    Post,
    Delete,
    Patch
}