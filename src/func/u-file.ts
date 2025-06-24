import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { UType } from "./u-type";
import { MaybeArray } from "../const/types";
import { XjsErr } from "../obj/xjs-err";

const s_errCode = 40;

interface FileStatus {
    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
}
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
    /**
     * remove a file. no error if the file to be removed doesn't exist.
     */
    export function rm(p: MaybeArray<string>): void {
        const pt = joinPath(p);
        if (fs.existsSync(pt)) fs.rmSync(pt, { recursive: true });
    }
    export function exists(p: MaybeArray<string>): boolean {
        return !!p && fs.existsSync(joinPath(p));
    }
    /**
     * return a file status. if the file of the status doesn't exist, this returns `null`.
     */
    export function status(p: MaybeArray<string>): FileStatus {
        const pt = joinPath(p);
        return fs.existsSync(pt) ? fs.statSync(pt) : null;
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
        const pt = joinPath(p)
        if (!pt || !fs.statSync(pt).isDirectory())
            throw new XjsErr(s_errCode, "Specified path for ls is not directory.");
        return fs.readdirSync(pt);
    }
    /**
     * check availability to export a file with specified directory and file name. 
     * if it doesn't, retry to check after appending incremental number (e.g. `.1`) to the filename.
     * @param dir destination directory path.
     * @param fname file name wanna export to.
     * @returns exportable file path.
     */
    export function reserveFilePath(dir: MaybeArray<string>, fname: string): string {
        const pt = joinPath(dir)
        if (!pt || !fs.statSync(pt).isDirectory())
            throw new XjsErr(s_errCode, "Specified directory path is not directory.");
        if (!fname || fname.match(/[\\/:*?"<>|]/))
            throw new XjsErr(s_errCode, "Specified filename is invalid due to empty or including disallowed characters.");
        let dest = joinPath(pt, fname), i = 1;
        while (fs.existsSync(dest)) dest = joinPath(pt, `${fname}.${i++}`);
        return dest;
    }
    /**
     * decompress zip file. this depends on os enviroment due to using the os command.
     * currently this supports only windows (installed `tar` or `unzip` in gnu compiler) and linux systems (installed `unzip`). 
     * @param zipPath zip file to be unzipped.
     * @param destDir directory that the decompress files export to.
     */
    export function unzip(zipPath: MaybeArray<string>, destDir?: MaybeArray<string>): void {
        if (!exists(zipPath)) throw new XjsErr(s_errCode, "There is no file on the zip path.");
        if (!!destDir && !exists(destDir)) throw new XjsErr(s_errCode, "The destination directory is not found.");
        let cmd = "unzip", options = null, availableCmd = true;
        if (destDir) options = `-d "${destDir}"`;
        const check = () => { try { execSync(`${cmd} --help`, { stdio: "ignore" }); } catch { availableCmd = false; } };
        check();
        if (process.platform === "win32") {
            if (!availableCmd) {
                cmd = "tar"; options = "-xf"; availableCmd = true;
                if (destDir) options = `-C "${destDir}" ${options}`;
                check();
            }
        } else if (process.platform === "linux") {
        } else throw new XjsErr(s_errCode, "The os running on is not supported for xjs unzip.");
        if (!availableCmd) throw new XjsErr(s_errCode, `"${cmd}" command is not installed.`);
        try { execSync([cmd, options, `"${zipPath}"`].filter(e => e).join(" "), { stdio: "ignore" }); } catch (e) {
            throw new XjsErr(s_errCode, "Something went wrong at unzip.", e);
        }
    }
    /**
     * @deprecated since v9.1.4
     * @removed this will be removed in v10.
     * @replaced it should uses this without namespace `UFile`.
     */
    export function joinPath(...p: MaybeArray<string>[]): string {
        return path.join(...p.flatMap(UType.takeAsArray));
    }
}