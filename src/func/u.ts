export function eq(s1: string, s2: string): boolean {
    return !s1 || !s2 ? s1 === s2 : s1.trim() === s2.trim();
}
export function getJSTDate() {
    return new Date(Date.now() + 9 * 60 * 60 * 1000);
}
export function delay(sec: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000 * sec));
}
export function toIntArray(size: number): number[] {
    return Array.from(Array(size).keys());
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
export function isDefined(v: any): boolean {
    return typeof v != "undefined";
}
export function bitor(...bit: number[]): number {
    return bit.reduce((a, b) => a | b);
}
export function trimStringValues(obj: any): void {
    Object.keys(obj)
        .filter(k => typeof obj[k] === "string")
        .forEach(k => obj[k] = obj[k]?.trim());
}
export function assignProperties<T extends {}>(t: T, s: {}, ...keys: any[]): T {
    for (const k of keys) if (isDefined(s[k])) t[k] = s[k];
    return t;
}
export function generateRandomString(len: number): string {
    return toIntArray(len).map(i => {
        let rnd = Math.floor(62 * Math.random());
        const remain = rnd - 52;
        if (remain >= 0) return remain.toString();
        if (rnd > 26) rnd += 6;
        return String.fromCharCode(rnd + 65);
    }).join("");
}

