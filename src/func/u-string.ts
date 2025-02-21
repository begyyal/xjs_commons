import { XjsErr } from "../obj/xjs-err";
import { int2array } from "./u";

const s_errCode = 20;

export namespace UString {
    export function eq(s1: string, s2: string): boolean {
        return !s1 || !s2 ? s1 === s2 : s1.trim() === s2.trim();
    }
    export function simpleDate2sec(date?: Date): string {
        return (date ?? new Date()).toISOString().split(".")[0].replace(/[-T:]/g, "");
    }
    export function simpleDate2day(date?: Date): string {
        return simpleDate2sec(date).substring(0, 8);
    }
    export function jpy2num(str: string): number {
        return Number(str.split(".")[0].replace(/\D+/g, ""));
    }
    export function trimProps(obj: any): void {
        Object.keys(obj)
            .filter(k => typeof obj[k] === "string")
            .forEach(k => obj[k] = obj[k]?.trim());
    }
    export function generateRandomString(len: number): string {
        return int2array(len).map(_ => {
            let rnd = Math.floor(62 * Math.random());
            const remain = rnd - 52;
            if (remain >= 0) return remain.toString();
            if (rnd > 26) rnd += 6;
            return String.fromCharCode(rnd + 65);
        }).join("");
    }
    export function idx2az(idx: number): string {
        let az = "", num = idx;
        while (num >= 0) {
            az = String.fromCharCode(num % 26 + 97) + az;
            num = Math.floor(num / 26) - 1;
        }
        return az.toUpperCase();
    }
    export function az2idx(az: string): number {
        if (!az?.match(/^[a-zA-Z]+$/))
            throw new XjsErr(s_errCode, "the parameter isn't az(AZ) format.");
        return az.toLowerCase().split("").map(c => c.charCodeAt(0) - 97).reverse()
            .map((idx, i) => (idx + 1) * (26 ** i)).reduce((v1, v2) => v1 + v2) - 1;
    }
}