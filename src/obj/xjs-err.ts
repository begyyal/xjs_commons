
export class XjsErr extends Error {
    constructor(public code: number, msg: string) { super(`[XJS] ${msg}`); }
}