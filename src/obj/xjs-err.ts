
export class XjsErr extends Error {
    constructor(
        public code: number,
        msg: string,
        public origin?: any,
    ) { super(`[XJS] ${msg}`); }
}