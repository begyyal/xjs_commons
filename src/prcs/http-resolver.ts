import * as tls from "tls";
import * as zlib from "zlib";
import { URL } from "url";
import { Agent, request as requestTls, RequestOptions } from "https";
import { request, IncomingMessage, OutgoingHttpHeaders } from "http";
import { AsyncLocalStorage } from "async_hooks";
import { XjsErr } from "../obj/xjs-err";
import { UHttp } from "../func/u-http";
import { UArray } from "../func/u-array";

export const s_clientMode: Record<string, ClientMode> = {
    nodejs: { id: 0, cipherOrder: null },
    chrome: { id: 1, cipherOrder: [2, 0, 1] },
    firefox: { id: 2, cipherOrder: [2, 1, 0] }
};
interface ClientMode {
    id: number;
    cipherOrder: number[];
}
interface RequestContext {
    mode: ClientMode;
    cmv: number;
    ciphers: string;
    redirectCount: number;
    cookies?: Record<string, string>;
    proxyAgent?: Agent;
}
interface ProxyConfig {
    server: string,
    port: number,
    auth?: { name: string, pass: string }
}
const s_cmvRange = 5;
const s_timeout = 1000 * 20;
const s_errCode = 200;

export class HttpResolver {
    private readonly _als = new AsyncLocalStorage<RequestContext>();
    private readonly _mode2headers = new Map<ClientMode, (cmv: number) => (Record<string, string>)>([
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
    /** 
     * @param _baseCmv chrome major version refered when construct a user agent, and the version will be randomized between `n` to `n-4`.
     * @param _l custom logger. default is `console`.
     */
    constructor(private _baseCmv: number, private _l: { log: (msg: any) => void, warn: (msg: any) => void } = console) { }
    /**
     * request to the url with GET.
     * @param url target url.
     * @param op.mode {@link s_clientMode} that is imitated. default is random between chrome or firefox.
     * @param op.proxy proxy configuration.
     * @param op.ignoreQuery if true, query part in the `url` is ignored.
     * @returns string encoded by utf-8 as response payload.
     */
    async get(
        url: string,
        op?: {
            mode?: ClientMode,
            ignoreQuery?: boolean,
            proxy?: ProxyConfig
        }): Promise<any> {
        const cmv = this._baseCmv - Math.floor(Math.random() * s_cmvRange);
        const m = op?.mode ?? UArray.randomPick([s_clientMode.chrome, s_clientMode.firefox]);
        const ciphers = this.createCiphers(m);
        const u = new URL(url);
        const proxyAgent = op?.proxy && await this.createProxyAgent(u, op.proxy);
        this._l.log(`Starts to request with ${Object.keys(s_clientMode).find((_, i) => i === m.id)}:${cmv}.`);
        return await this._als.run({ mode: m, cmv, ciphers, redirectCount: 0, proxyAgent }, this.getIn, u, !!op?.ignoreQuery);
    }
    private createProxyAgent(u: URL, conf: ProxyConfig): Promise<Agent> {
        return new Promise((resolve, reject) => {
            const headers = {}
            if (conf.auth) headers['Proxy-Authorization'] = `Basic ${Buffer.from(conf.auth.name + ':' + conf.auth.pass).toString('base64')}`;
            const req = request({
                host: conf.server,
                port: conf.port,
                method: 'CONNECT',
                path: `${u.hostname}:443`,
                headers
            }).on('connect', (res, socket) => {
                if (res.statusCode === 200) resolve(new Agent({ socket: socket, keepAlive: true }));
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
    private getIn = (
        u: URL,
        ignoreQuery: boolean = false): Promise<any> => {
        const params: RequestOptions = {};
        params.method = "GET";
        params.protocol = u.protocol;
        params.host = u.host;
        params.path = (ignoreQuery || !u.search) ? u.pathname : `${u.pathname}${u.search}`;
        params.agent = this._als.getStore().proxyAgent;
        return this.reqHttps(params, null);
    };
    private reqHttps(
        params: RequestOptions,
        postData: any,
        ignoreQuery: boolean = false): Promise<any> {
        params.timeout = s_timeout;
        if (this._als.getStore().mode.id > 0) {
            params.ciphers = this._als.getStore().ciphers;
            const chHeaders = this._mode2headers.get(this._als.getStore().mode)(this._als.getStore().cmv);
            params.headers = params.headers ? Object.assign(params.headers, chHeaders) : chHeaders
        }
        if (this._als.getStore().cookies) this.setCookies(params.headers);
        return new Promise<any>((resolve, reject) => {
            const req = requestTls(params, (res: IncomingMessage) => {
                const sc = UHttp.statusCategoryOf(res.statusCode);
                if (sc === 3) {
                    if (!res.headers.location) throw new XjsErr(s_errCode, "Received http redirection, but no location header found.");
                    if (this._als.getStore().redirectCount++ > 2) throw new XjsErr(s_errCode, "Count of http redirection exceeds limit.");
                    if (res.headers["set-cookie"]) this.storeCookies(res.headers["set-cookie"]);
                    this.log(`Redirect to ${res.headers.location}. (count is ${this._als.getStore().redirectCount})`);
                    res.on('end', () => { });
                    const dest = res.headers.location.startsWith("http") ? res.headers.location : `https://${params.host}${res.headers.location}`;
                    this.getIn(new URL(dest), ignoreQuery).then(resolve).catch(reject);
                    return;
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
                        } else resolve(data);
                    } catch (e) { reject(e); }
                });
            });
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy();
                reject(new XjsErr(s_errCode, "The http request timeout, maybe server did not respond."));
            });
            if (postData) req.write(postData);
            req.end();
        });
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
        const cks = this._als.getStore().cookies;
        headers.cookie = Object.keys(cks).map(ckk => `${ckk}=${cks[ckk]};`).join(" ");
    }
    private storeCookies(cookies: string[]): void {
        this._als.getStore().cookies ??= {};
        cookies.filter(c => c).flatMap(c => c.split(";"))
            .map(c => {
                const idx = c.indexOf("=");
                return idx !== -1 && [c.substring(0, idx).toLowerCase().trim(), c.substring(idx + 1)];
            })
            .filter(cp => cp && cp[0] && !["secure", "path", "domain", "samesite"].includes(cp[0]))
            .forEach(cp => this._als.getStore().cookies[cp[0]] = cp[1]);
        this.log("Store cookies from set-cookie headers.");
        this.log(JSON.stringify(this._als.getStore().cookies));
    }
    private log(msg: string): void {
        this._l.log(`[http-resolver] ${msg}`);
    }
    private warn(msg: string): void {
        this._l.warn(`[http-resolver] ${msg}`);
    }
}