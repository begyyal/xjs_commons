import * as fs from "fs";
import * as path from "path";
import { UType } from "./u-type";
import { MaybeArray } from "../const/types";
import { XjsErr } from "../obj/xjs-err";

const s_errCode = 40;

export namespace UFile {
    export function mkdir(p: MaybeArray<string>): boolean {
        const dirPath = joinPath(p);
        const e = fs.existsSync(dirPath);
        if (!e) fs.mkdirSync(dirPath, { recursive: true });
        else if (!fs.statSync(dirPath).isDirectory())
            throw new XjsErr(s_errCode, "Already exists a file (not directory) on the path.");
        return !e;
    }
    export function write(p: MaybeArray<string>, c: string): void {
        fs.writeFileSync(joinPath(p), c);
    }
    export function rm(p: MaybeArray<string>): void {
        fs.rmSync(joinPath(p), { recursive: true });
    }
    export function exists(p: MaybeArray<string>): boolean {
        return fs.existsSync(joinPath(p));
    }
    export function read(p: MaybeArray<string>): Buffer;
    export function read(p: MaybeArray<string>, encoding: BufferEncoding): string;
    export function read(p: MaybeArray<string>, encoding?: BufferEncoding): Buffer | string {
        const f = joinPath(p);
        if (!fs.existsSync(f)) throw new XjsErr(s_errCode, `No file found => ${f}`);
        return fs.readFileSync(f, encoding);
    }
    export function cp(from: MaybeArray<string>, to: MaybeArray<string>): void {
        const f = joinPath(from), t = joinPath(to);
        if (!fs.existsSync(f)) throw new XjsErr(s_errCode, `No file found => ${f}`);
        fs.copyFileSync(f, t);
    }
    export function mv(from: MaybeArray<string>, to: MaybeArray<string>): void {
        const f = joinPath(from), t = joinPath(to);
        if (!fs.existsSync(f)) throw new XjsErr(s_errCode, `No file found => ${f}`);
        fs.renameSync(f, t);
    }
    export function ls(p: MaybeArray<string>): string[] {
        const dir = joinPath(p)
        if (!fs.statSync(dir).isDirectory())
            throw new XjsErr(s_errCode, "Specified path for ls is not directory.");
        return fs.readdirSync(dir);
    }
    export function joinPath(...p: MaybeArray<string>[]): string {
        return path.join(...p.flatMap(UType.takeAsArray));
    }
}