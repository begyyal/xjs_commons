import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import { ClientMode, ProxyConfig } from "./http-resolver";
import { s_clientMode } from "./http-resolver-context";

export interface ClientOption {
    mode?: ClientMode;
    proxy?: ProxyConfig;
}
export interface RequestOption {
    headers?: OutgoingHttpHeaders;
    /**
     * if true, query part in the `url` is ignored.
     */
    ignoreQuery?: boolean;
    /**
     * destination directory or file path for download. this is only used when `Content-Disposition` header exists. 
     * default is current directory of the process with `filename` of the disposition.
     */
    downloadPath?: string;
}
export interface HttpResponse {
    /**
     * http headers in the response.
     */
    headers?: IncomingHttpHeaders;
    /**
     * string encoded by utf-8 as response payload.
     */
    payload?: string;
}
export interface IHttpClient {
    /**
     * request GET to the url with new context.
     * @param url target url.
     * @param op.headers http headers.
     * @param op.mode {@link s_clientMode} that is imitated. default is random between chrome or firefox.
     * @param op.proxy proxy configuration.
     * @param op.ignoreQuery {@link RequestOption.ignoreQuery}
     * @param op.downloadPath {@link RequestOption.downloadPath}
     * @param op.redirectAsNewRequest handle redirect as new request. this may be efficient when using proxy which is implemented reverse proxy.
     * @returns http response. {@link HttpResponse}
     */
    get(url: string, op?: RequestOption & ClientOption & { redirectAsNewRequest?: boolean }): Promise<HttpResponse>;
    /**
     * request POST to the url with new context.
     * @param url target url.
     * @param payload request payload. if this is an object, it is treated as json.
     * @param op.headers http headers.
     * @param op.mode {@link s_clientMode} that is imitated. default is random between chrome or firefox.
     * @param op.proxy proxy configuration.
     * @param op.ignoreQuery {@link RequestOption.ignoreQuery}
     * @param op.downloadPath {@link RequestOption.downloadPath}
     * @returns http response. {@link HttpResponse}
     */
    post(url: string, payload: any, op?: RequestOption & ClientOption): Promise<HttpResponse>;
}