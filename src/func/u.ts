import { XjsErr } from "../obj/xjs-err";

const s_errCode = 10;

export function getJSTDate(d?: Date): Date {
    return new Date((d ? d.getTime() : Date.now()) + 9 * 60 * 60 * 1000);
}
export function delay(sec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000 * sec));
}
export function int2array(size: number): number[] {
    const s = Number(size);
    if (Number.isNaN(s)) throw new XjsErr(s_errCode, "size of the argument is not number.");
    return Array.from(Array(s).keys());
}
export function array2map<K, T>(array: T[], keyGen: (e: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const e of array) {
        const k = keyGen(e);
        if (map.has(k)) map.get(k).push(e);
        else map.set(k, [e]);
    }
    return map;
}
export function bitor(...bit: number[]): number {
    return bit.reduce((a, b) => a | b);
}
export function checkPortAvailability(port: number): Promise<boolean> {
    return new Promise(resolve => {
        const server = require('net').createServer();
        server.once('error', () => resolve(false))
            .once('listening', () => { server.close(); resolve(true); })
            .listen(port);
    });
}
