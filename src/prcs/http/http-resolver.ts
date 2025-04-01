import { OutgoingHttpHeaders } from "http";
import { XjsErr } from "../../obj/xjs-err";
import { HttpResolverContext } from "./http-resolver-context";

export interface ClientMode {
    id: number;
    cipherOrder: number[];
}
export interface ProxyConfig {
    server: string;
    port: number;
    auth?: { name: string, pass: string };
}
export interface ClientOption {
    mode?: ClientMode;
    proxy?: ProxyConfig;
}
export interface RequestOption {
    ignoreQuery?: boolean;
    headers?: OutgoingHttpHeaders;
}
const s_cmvRange = 5;
export class HttpResolver {
    /** 
     * @param _baseCmv chrome major version refered when construct a user agent, and the version will be randomized between `n` to `n-4`.
     * @param _l custom logger. default is `console`.
     */
    constructor(
        private _baseCmv: number,
        private _l: { log: (msg: any) => void, warn: (msg: any) => void } = console) { }
    /**
     * create a http client as new context that keeps some states. (browser type, cookies, ciphers order, etc...)
     * @param op.mode {@link s_clientMode} that is imitated. default is random between chrome or firefox.
     * @param op.proxy proxy configuration.
     * @returns a http client as new context.
     */
    newContext(op?: ClientOption): HttpResolverContext {
        return new HttpResolverContext(this.fixCmv(), op, this._l);
    }
    /**
     * request GET to the url with new context.
     * @param url target url.
     * @param op.headers http headers.
     * @param op.mode {@link s_clientMode} that is imitated. default is random between chrome or firefox.
     * @param op.proxy proxy configuration.
     * @param op.ignoreQuery if true, query part in the `url` is ignored.
     * @param op.redirectAsNewRequest handle redirect as new request. this may be efficient when using proxy which is implemented reverse proxy.
     * @returns string encoded by utf-8 as response payload.
     */
    async get(url: string, op?: RequestOption & ClientOption & { redirectAsNewRequest?: boolean }): Promise<any> {
        let redirectCount = op?.redirectAsNewRequest && -1;
        const bindOp = () => {
            const option = Object.assign({}, op);
            if (redirectCount) Object.assign(option, { outerRedirectCount: ++redirectCount });
            return option;
        };
        try {
            return await this.newContext(op).get(url, bindOp());
        } catch (e) {
            if (!(e instanceof XjsErr) || e.code !== -1) throw e;
            else return await this.newContext(op).get(e.message, bindOp());
        }
    }
    /**
     * request POST to the url with new context.
     * @param url target url.
     * @param payload request payload. if this is an object, it is treated as json.
     * @param op.headers http headers.
     * @param op.mode {@link s_clientMode} that is imitated. default is random between chrome or firefox.
     * @param op.proxy proxy configuration.
     * @param op.ignoreQuery if true, query part in the `url` is ignored.
     * @returns string encoded by utf-8 as response payload.
     */
    async post(url: string, payload: any, op?: RequestOption & ClientOption): Promise<any> {
        return await this.newContext(op).post(url, payload, op);
    }
    private fixCmv(): number {
        return this._baseCmv - Math.floor(Math.random() * s_cmvRange);
    }
}