import { TimeUnit } from "../const/time-unit";
import { XjsErr } from "../obj/xjs-err";
import { int2array } from "./u";
import { UType } from "./u-type";

const s_errCode = 20;

export namespace UString {
    export function eq(s1: string, s2: string): boolean {
        return !UType.isString(s1) || !UType.isString(s2) ? s1 === s2 : s1.trim() === s2.trim();
    }
    /**
     * generate date time number as fixed length (depends on `unit`) string without separator charactor.  
     * For example, `2025-06-08T10:15:06.366Z` is to be `20250608101506366`.
     * @param op.date Date object refered by this. default is `new Date()`.
     * @param op.unit time unit. default is secound.
     */
    export function simpleTime(op?: { date?: Date, unit?: TimeUnit }): string {
        const t = (op?.date ?? new Date()).toISOString().split(".")[0].replace(/[-T:]/g, "");
        if (op?.unit === TimeUnit.Msec) return t;
        return t.substring(0, 10 - (6 - (op?.unit ?? TimeUnit.Sec)) * 2);
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