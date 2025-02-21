import { array2map } from "./u";

export namespace UArray {
    export function eq<T>(v1: T[], v2: T[]): boolean {
        return (!v1 && !v2 || v1 && v2) &&
            v1.length === v2.length &&
            v1.every(v1v => v2.includes(v1v));
    }
    export function distinct<T>(array: T[]): T[];
    export function distinct<T>(array: T[],
        op: { k: keyof T, takeLast?: boolean }): T[];
    export function distinct<T>(array: T[],
        op: { predicate: (v1: T, v2: T) => boolean, takeLast?: boolean }): T[]
    export function distinct<T>(array: T[],
        op?: { k?: keyof T, predicate?: (v1: T, v2: T) => boolean, takeLast?: boolean }): T[] {
        if (!array || array.length === 0) return [];
        if (op?.k)
            return Array.from(array2map(array, e => e[op.k]).values()).map(a => op?.takeLast ? a.pop() : a.shift());
        const a = op?.takeLast ? [...array].reverse() : array;
        return a.filter((v, i) => a.findIndex(v2 => op?.predicate ? op?.predicate(v, v2) : v == v2) === i);
    }
    export function chop<T>(array: T[], len: number): T[][] {
        return [...Array(Math.ceil(array.length / len)).keys()]
            .map(i => {
                let endIdx = (i + 1) * len;
                if (endIdx > array.length) endIdx = array.length;
                return array.slice(i * len, endIdx);
            });
    }
    export function remove<T>(array: T[], v: T): void {
        const idx = array.indexOf(v);
        if (idx !== -1) array.splice(idx, 1);
    }
    export function takeOut<T>(array: T[], filter: (v: T, i?: number) => boolean): T[] {
        const result = [];
        for (let i = array.length - 1; i >= 0; i--)
            if (filter(array[i], i)) {
                result.unshift(array[i]);
                array.splice(i, 1);
            }
        return result;
    }
}