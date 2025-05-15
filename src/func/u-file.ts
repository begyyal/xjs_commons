import * as fs from "fs";
import * as path from "path";
import { UType } from "./u-type";
import { MaybeArray } from "../const/types";

export namespace UFile {
    export function mkdir(p: MaybeArray<string>): boolean {
        const dirPath = join(p);
        const e = fs.existsSync(dirPath);
        if (!e || !fs.statSync(dirPath).isDirectory()) fs.mkdirSync(dirPath, { recursive: true });
        return !e;
    }
    export function write(p: MaybeArray<string>, c: string): void {
        fs.writeFileSync(join(p), c);
    }
    export function exists(...p: string[]): boolean {
        return !!p && fs.existsSync(path.join(...p));
    }
    export function read(p: MaybeArray<string>): Buffer;
    export function read(p: MaybeArray<string>, encoding: BufferEncoding): string;
    export function read(p: MaybeArray<string>, encoding?: BufferEncoding): Buffer | string {
        return fs.readFileSync(join(p), encoding);
    }
    export function cp(from: MaybeArray<string>, to: MaybeArray<string>): void {
        const f = join(from), t = join(to);
        if (fs.existsSync(f)) fs.writeFileSync(t, fs.readFileSync(f));
    }
    export function mv(from: MaybeArray<string>, to: MaybeArray<string>): void {
        const f = join(from), t = join(to);
        if (fs.existsSync(f) && fs.statSync(f).isFile()) {
            fs.writeFileSync(t, fs.readFileSync(f));
            fs.rmSync(f, { force: true });
        }
    }
    function join(p: MaybeArray<string>): string {
        return UType.isString(p) ? p : path.join(...p);
    }
}