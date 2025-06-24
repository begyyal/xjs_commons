import * as path from "path";
import { Loggable, MaybeArray } from "../const/types";
import { XjsErr } from "../obj/xjs-err";
import { UType } from "./u-type";

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
export interface RetryOption<T = void | Promise<void>> {
    count?: number;
    logger?: Loggable;
    errorCriterion?: (e: any) => boolean,
    intervalPredicate?: () => T
};
/**
 * runs callback with customizable retry.
 * @param cb callback to be retried.
 * @param op.count number of retries. default is 1.
 * @param op.logger logger used for exceptions while retrying the process. default is `console` object.
 * @param op.errorCriterion distinguish whether retry is required form exceptions. default is none. (i.e. allways required.)
 * @param op.intervalPredicate predicate that runs between callbacks when retrying.
 */
export function retry<T>(cb: () => T, op?: RetryOption<void>): T;
export function retry<T>(cb: () => T, op?: RetryOption<Promise<void>>): Promise<T>;
export function retry<T>(cb: () => Promise<T>, op?: RetryOption<void>): Promise<T>;
export function retry<T>(cb: () => Promise<T>, op?: RetryOption<Promise<void>>): Promise<T>;
export function retry<T>(cb: () => T | Promise<T>, op?: RetryOption): T | Promise<T> {
    const l = op?.logger ?? console;
    const initialCount = op?.count ?? 1;
    const handleError = (e: any) => {
        if (op?.errorCriterion && !op.errorCriterion(e)) return false;
        l.warn(e); return true;
    };
    const prcs = (c: number) => {
        if (c < 0) throw new XjsErr(s_errCode, "failure exceeds retryable count.");
        let ret = null;
        const innerPrcs = () => {
            try { ret = cb(); } catch (e) { if (handleError(e)) ret = prcs(c - 1); else throw e; }
            if (ret instanceof Promise) {
                return new Promise((resolve, reject) =>
                    ret.then(resolve).catch((e: any) => { if (handleError(e)) resolve(prcs(c - 1)); else reject(e); }));
            } else return ret;
        };
        if (c < initialCount && op?.intervalPredicate)
            ret = op?.intervalPredicate();
        return ret instanceof Promise ? ret.then(() => innerPrcs()) : innerPrcs();
    };
    return prcs(initialCount);
}
export function joinPath(...p: MaybeArray<string>[]): string {
    return path.join(...p.flatMap(UType.takeAsArray));
}