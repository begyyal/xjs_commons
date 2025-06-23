import * as tls from "tls";
import * as zlib from "zlib";
import * as fs from "fs";
import * as path from "path";
import { URL } from "url";
import { Agent, request as requestTls, RequestOptions } from "https";
import { request, IncomingMessage, OutgoingHttpHeaders } from "http";
import { AsyncLocalStorage } from "async_hooks";
import { XjsErr } from "../../obj/xjs-err";
import { UHttp } from "../../func/u-http";
import { UArray } from "../../func/u-array";
import { HttpMethod } from "../../const/http-method";
import { ClientMode, ProxyConfig } from "./http-resolver";
import { ClientOption, HttpResponse, IHttpClient, RequestOption } from "./i-http-client";
import { UType } from "../../func/u-type";
import { Loggable } from "../../const/types";
import { UFile } from "../../func/u-file";
import { UString } from "../../func/u-string";

interface RequestContext extends RequestOption {
    redirectCount: number;
    proxyAgent?: Agent;
    outerRedirectCount?: number;
}
export const s_clientMode: Record<string, ClientMode> = {
    nodejs: { id: 0, cipherOrder: null },
    chrome: { id: 1, cipherOrder: [2, 0, 1] },
    firefox: { id: 2, cipherOrder: [2, 1, 0] }
};
const s_timeout = 1000 * 20;
const s_errCode = 200;
const s_redirectLimit = 5;
const s_mode2headers = new Map<ClientMode, (cmv: number) => (Record<string, string>)>([
    [s_clientMode.firefox, (cmv: number) => ({
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.5",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${cmv}.0) Gecko/20100101 Firefox/${cmv}.0`
    })],
    [s_clientMode.chrome, (cmv: number) => {
        const uad = cmv < 130
            ? `"Not/A)Brand";v="8", "Chromium";v="${cmv}", "Google Chrome";v="${cmv}"`
            : `"Chromium";v="${cmv}", "Not:A-Brand";v="24", "Google Chrome";v="${cmv}"`;
        const ch = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-Ch-Ua": uad,
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": "Windows",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${cmv}.0.0.0 Safari/537.36`
        };
        if (cmv >= 124) ch["Priority"] = "u=0, i";
        return ch;
    }]]);

export class HttpResolverContext implements IHttpClient {
    private readonly _als = new AsyncLocalStorage<RequestContext>();
    private readonly _mode: ClientMode;
    private readonly _ciphers: string;
    private readonly _proxyConfig?: ProxyConfig;
    private readonly _chHeaders: Record<string, string>;
    private _cookies?: Record<string, string>;
    constructor(
        private readonly _cmv: number,
        op?: ClientOption,
        private _l: Loggable = console) {
        this._mode = op?.mode ?? UArray.randomPick([s_clientMode.chrome, s_clientMode.firefox]);
        this._ciphers = this.createCiphers(this._mode);
        this._proxyConfig = op?.proxy;
        this._chHeaders = s_mode2headers.get(this._mode)(this._cmv);
        this._l.log(`Context launched with ${Object.keys(s_clientMode).find((_, i) => i === this._mode.id)}:${this._cmv}.`);
    }
    /**
     * request GET to the url.
     * @param url target url.
     * @param op.headers http headers.
     * @param op.ignoreQuery {@link RequestOption.ignoreQuery}
     * @param op.downloadPath {@link RequestOption.downloadPath}
     * @returns string encoded by utf-8 as response payload.
     */
    async get(url: string, op?: RequestOption & { outerRedirectCount?: number }): Promise<HttpResponse> {
        const u = new URL(url);
        const proxyAgent = this._proxyConfig && await this.createProxyAgent(u);
        const rc = { redirectCount: op?.outerRedirectCount ?? 0, proxyAgent };
        Object.assign(rc, op);
        return await this._als.run(rc, this.getIn, u).finally(() => proxyAgent?.destroy());
    }
    /**
     * request POST to the url.
     * @param url target url.
     * @param payload request payload. if this is an object, it is treated as json.
     * @param op.headers http headers.
     * @param op.ignoreQuery {@link RequestOption.ignoreQuery}
     * @param op.downloadPath {@link RequestOption.downloadPath}
     * @returns string encoded by utf-8 as response payload.
     */
    async post(url: string, payload: any, op?: RequestOption): Promise<HttpResponse> {
        const u = new URL(url);
        const proxyAgent = this._proxyConfig && await this.createProxyAgent(u);
        const rc = { redirectCount: 0, proxyAgent };
        Object.assign(rc, op);
        return await this._als.run(rc, this.postIn, u, payload).finally(() => proxyAgent?.destroy());
    }
    private createProxyAgent(u: URL): Promise<Agent> {
        const conf = this._proxyConfig;
        return new Promise((resolve, reject) => {
            const headers = {}
            if (conf.auth) headers['Proxy-Authorization'] = `Basic ${Buffer.from(conf.auth.name + ':' + conf.auth.pass).toString('base64')}`;
            const req = request({
                host: conf.server,
                port: conf.port,
                method: HttpMethod.Connect,
                path: `${u.hostname}:443`,
                headers
            }).on('connect', (res, socket) => {
                if (res.statusCode === 200) resolve(new Agent({ socket, keepAlive: true }));
                else reject(new XjsErr(s_errCode, "Could not connect to proxy."));
            });
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new XjsErr(s_errCode, "The http request timeout, maybe server did not respond."));
            });
            req.end();
        });
    }
    private getIn = async (u: URL): Promise<HttpResponse> => {
        const params: RequestOptions = {};
        const rc = this._als.getStore();
        params.method = HttpMethod.Get;
        params.headers = rc.headers ?? {};
        return await this.reqHttps(u, params);
    };
    private postIn = async (u: URL, payload: any): Promise<HttpResponse> => {
        const params: RequestOptions = {};
        const rc = this._als.getStore();
        params.method = HttpMethod.Post;
        params.headers = rc.headers ?? {};
        let p = payload;
        if (UType.isObject(payload)) {
            p = JSON.stringify(payload);
            params.headers["Content-Length"] = (p as string).length;
            params.headers["Content-Type"] = "application/json";
        }
        return await this.reqHttps(u, params, p);
    };
    private reqHttps(u: URL, params: RequestOptions, payload?: any): Promise<HttpResponse> {
        const rc = this._als.getStore();
        params.timeout = s_timeout;
        params.protocol = u.protocol;
        params.host = u.host;
        params.path = (rc.ignoreQuery || !u.search) ? u.pathname : `${u.pathname}${u.search}`;
        params.agent = rc.proxyAgent;
        if (this._mode.id > 0) {
            params.ciphers = this._ciphers;
            params.headers = params.headers ? Object.assign(params.headers, this._chHeaders) : this._chHeaders
        }
        if (this._cookies) this.setCookies(params.headers);
        return new Promise<HttpResponse>((resolve, reject) => {
            const req = requestTls(params,
                (res: IncomingMessage) => this.processResponse(resolve, reject, rc, params.host, res));
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new XjsErr(s_errCode, "The http request timeout, maybe server did not respond."));
            });
            if (payload) req.write(payload);
            req.end();
        });
    }
    private processResponse(
        resolve: (v: any) => void,
        reject: (r?: any) => void,
        rc: RequestContext,
        host: string,
        res: IncomingMessage): void {
        if (res.headers["set-cookie"]) this.storeCookies(res.headers["set-cookie"]);
        const sc = UHttp.statusCategoryOf(res.statusCode);
        if (sc === 3) {
            this.handleRedirect(res, host).then(resolve).catch(reject).finally(() => res.destroy());
            return;
        }
        if (res.headers["content-disposition"]?.trim().startsWith("attachment")) {
            try {
                const dest = this.resolveDownloadPath(rc.downloadPath, res.headers["content-disposition"]);
                const stream = fs.createWriteStream(dest);
                res.pipe(stream);
                stream.on("finish", () => stream.close());
                resolve({ headers: res.headers });
            } catch (e) {
                if (e instanceof XjsErr) reject(e);
                else {
                    this.error(e);
                    reject(new XjsErr(s_errCode, "Failed to download a file."));
                }
            }
        }
        const bfs: Buffer[] = [];
        const contentEncofing = res.headers["content-encoding"]?.toLocaleLowerCase();
        res.on('data', chunk => bfs.push(chunk));
        res.on('end', () => {
            try {
                let retBuf = Buffer.concat(bfs);
                if (contentEncofing == "gzip")
                    retBuf = zlib.gunzipSync(retBuf);
                else if (contentEncofing == "br")
                    retBuf = zlib.brotliDecompressSync(retBuf);
                const data = retBuf.toString("utf8");
                if (sc !== 2) {
                    if (data.trim()) this.warn(data);
                    reject(new XjsErr(s_errCode, `Https received a error status ${res.statusCode}`));
                } else resolve({ payload: data, headers: res.headers });
            } catch (e) { reject(e); }
        });
    }
    private resolveDownloadPath(opPath: string, disposition: string): string {
        const appendFname = (d: string) => {
            const fname = disposition.split(";")
                .find(f => f.trim().startsWith("filename"))
                ?.replace(/^\s+filename\s+=/, "").trim()
                ?? UFile.reserveFilePath(d, `xjs-download_${UString.simpleTime()}`);
            return UFile.joinPath(d, fname);
        };
        if (opPath) {
            const st = UFile.status(opPath);
            if (!st || st.isFile()) {
                if (!UFile.exists(path.dirname(opPath))) throw new XjsErr(s_errCode, "Directory of the download file was not found.");
                return opPath;
            }
            if (st.isDirectory()) {
                if (!UFile.exists(opPath)) throw new XjsErr(s_errCode, "Directory of the download path was not found.");
                return appendFname(opPath);
            }
        }
        return appendFname("./");
    }
    private async handleRedirect(res: IncomingMessage, host: string): Promise<HttpResponse> {
        const rc = this._als.getStore();
        if (!res.headers.location) throw new XjsErr(s_errCode, "Received http redirection, but no location header found.");
        if (rc.redirectCount++ > s_redirectLimit) throw new XjsErr(s_errCode, "Count of http redirection exceeds limit.");
        this.log(`Redirect to ${res.headers.location}. (count is ${rc.redirectCount})`);
        const dest = res.headers.location.startsWith("http") ? res.headers.location : `https://${host}${res.headers.location}`;
        if (rc.outerRedirectCount) throw new XjsErr(-1, dest);
        const u = new URL(dest);
        // consider for proxy which implements reverse proxy.
        if (rc.proxyAgent) {
            rc.proxyAgent?.destroy();
            rc.proxyAgent = await this.createProxyAgent(u);
        }
        return await this.getIn(u);
    }
    private createCiphers(mode: ClientMode): string {
        const defaultCiphers = tls.DEFAULT_CIPHERS.split(':');
        return [
            defaultCiphers[mode.cipherOrder[0]],
            defaultCiphers[mode.cipherOrder[1]],
            defaultCiphers[mode.cipherOrder[2]],
            ...UArray.shuffle(defaultCiphers.slice(3))
        ].join(':');
    }
    private setCookies(headers: OutgoingHttpHeaders): void {
        const exp = this._cookies["expires"];
        if (exp && new Date(exp).getTime() <= Date.now()) {
            this._cookies = null;
            this.log("Cookies was cleared due to an expiraion.");
        } else headers.cookie = Object.keys(this._cookies)
            .filter(ckk => !["expires", "max-age"].includes(ckk))
            .map(ckk => `${ckk}=${this._cookies[ckk]};`).join(" ");
    }
    private storeCookies(cookies: string[]): void {
        this._cookies ??= {};
        cookies.filter(c => c).flatMap(c => c.split(";"))
            .map(c => {
                const idx = c.indexOf("=");
                return idx !== -1 && [c.substring(0, idx).toLowerCase().trim(), c.substring(idx + 1)];
            })
            .filter(cp => cp && cp[0] && !["secure", "path", "domain", "samesite"].includes(cp[0]))
            .forEach(cp => this._cookies[cp[0]] = cp[1]);
        this.log("Store cookies from set-cookie headers.");
        this.log(JSON.stringify(this._cookies));
    }
    private log(msg: string): void {
        this._l.log(`[http-resolver] ${msg}`);
    }
    private warn(msg: string): void {
        this._l.warn(`[http-resolver] ${msg}`);
    }
    private error(msg: string): void {
        this._l.error(`[http-resolver] ${msg}`);
    }
}