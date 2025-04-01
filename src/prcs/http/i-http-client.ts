import { OutgoingHttpHeaders } from "http";
import { ClientMode, ProxyConfig } from "./http-resolver";

export interface ClientOption {
    mode?: ClientMode;
    proxy?: ProxyConfig;
}
export interface RequestOption {
    ignoreQuery?: boolean;
    headers?: OutgoingHttpHeaders;
}
export interface IHttpClient {
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
    get(url: string, op?: RequestOption & ClientOption & { redirectAsNewRequest?: boolean }): Promise<any>;
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
    post(url: string, payload: any, op?: RequestOption & ClientOption): Promise<any>;
}