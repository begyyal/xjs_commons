import * as tls from "tls";
import * as zlib from "zlib";
import { URL } from "url";
import { request, RequestOptions } from "https";
import { IncomingMessage, OutgoingHttpHeaders } from "http";
import { AsyncLocalStorage } from "async_hooks";
import { UHttp } from "..";
import { XjsErr } from "../obj/xjs-err";

export interface ClientMode {
    id: number
    cipherOrder: number[]
}
interface RequestContext {
    redirectCount: number
    cookies?: { [k: string]: string }
}
export const s_clientMode = {
    nodejs: { id: 0, cipherOrder: null } as ClientMode,
    chrome: { id: 1, cipherOrder: [2, 0, 1] } as ClientMode,
    firefox: { id: 2, cipherOrder: [2, 1, 0] } as ClientMode
};
const s_timeout = 1000 * 20;
const s_errCode = 200;

export class HttpResolver {
    private readonly _als = new AsyncLocalStorage<RequestContext>();
    private readonly _mode2headers = new Map<ClientMode, () => ({ [k: string]: string })>([
        [s_clientMode.firefox, () => ({
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "en-US,en;q=0.5",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0"
        })]]);
    constructor(cmv: number, private l?: { log: (msg: any) => void, warn: (msg: any) => void }) {
        const ch = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br, zstd",
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-Ch-Ua": `"Not/A)Brand";v="8", "Chromium";v="${cmv}", "Google Chrome";v="${cmv}"`,
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
        this._mode2headers.set(s_clientMode.chrome, () => ch);
    }
    get(
        url: string,
        mode: ClientMode = s_clientMode.chrome,
        ignoreQuery: boolean = false): Promise<any> {
        return this._als.run({ redirectCount: 0 }, this.getIn, url, mode, ignoreQuery);
    }
    private getIn = (
        url: string,
        mode: ClientMode = s_clientMode.chrome,
        ignoreQuery: boolean = false) => {
        const u = new URL(url);
        const params: RequestOptions = {};
        params.method = "GET";
        params.protocol = u.protocol;
        params.host = u.host;
        params.path = (ignoreQuery || !u.search) ? u.pathname : `${u.pathname}${u.search}`;
        return this.reqHttps(params, null, mode);
    };
    private reqHttps(
        params: RequestOptions,
        postData: any,
        mode: ClientMode = s_clientMode.chrome,
        ignoreQuery: boolean = false): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            params.timeout = s_timeout;
            if (mode.id > 0) {
                params.ciphers = this.createCiphers(mode);
                const chHeaders = this._mode2headers.get(mode)();
                params.headers = params.headers ? Object.assign(params.headers, chHeaders) : chHeaders
            }
            if (this._als.getStore().cookies) this.setCookies(params.headers);
            const req = request(params, (res: IncomingMessage) => {
                const sc = UHttp.statusCategoryOf(res.statusCode);
                if (sc === 3) {
                    if (!res.headers.location) throw new XjsErr(s_errCode, "Received http redirection, but no location header found.");
                    if (this._als.getStore().redirectCount++ > 2) throw new XjsErr(s_errCode, "Count of http redirection exceeds limit.");
                    if (res.headers["set-cookie"]) this.storeCookies(res.headers["set-cookie"]);
                    this.log(`Redirect to ${res.headers.location}. (count is ${this._als.getStore().redirectCount})`);
                    res.on('end', () => { });
                    const dest = res.headers.location.startsWith("http") ? res.headers.location : `https://${params.host}${res.headers.location}`;
                    this.getIn(dest, mode, ignoreQuery).then(resolve).catch(reject);
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
            ...defaultCiphers.slice(3)
                .map(cipher => ({ cipher, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ cipher }) => cipher)
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
        this.l?.log(`[http-resolver] ${msg}`);
    }
    private warn(msg: string): void {
        this.l?.warn(`[http-resolver] ${msg}`);
    }
}