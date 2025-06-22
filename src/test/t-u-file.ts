import { UFile } from "../func/u-file";

const s_workingDir = UFile.joinPath(__dirname, "tmp");
function test_joinPath(): void {
    if (s_workingDir != UFile.joinPath([__dirname, "tmp"]))
        throw Error("[UFile.joinPath] couldn't accept arguments properly.");
}
function initialize(): void {
    UFile.mkdir(s_workingDir);
    if (!UFile.exists(s_workingDir))
        throw Error("[UFile.mkdir] the working directory was not created.");
}
function finalize(): void {
    UFile.rm(s_workingDir);
    if (UFile.exists(s_workingDir))
        throw Error("[UFile.rm] the working directory was not removed.");
}
function test_write(): void {
    UFile.write([s_workingDir, "a.txt"], "aaa");
    if (!UFile.exists([s_workingDir, "a.txt"]))
        throw Error("[UFile.write] the file was not created.");
}
function test_read(): void {
    const c = UFile.read([s_workingDir, "a.txt"], "utf-8");
    if (c != "aaa") throw Error("[UFile.read] couldn't read the file correctly. (or might be wrote correctly)");
}
function test_cp(): void {
    UFile.cp([s_workingDir, "a.txt"], [s_workingDir, "b.txt"]);
    if (!UFile.exists([s_workingDir, "b.txt"]))
        throw Error("[UFile.cp] the file was not copied.");
}
function test_mv(): void {
    UFile.mv([s_workingDir, "a.txt"], [s_workingDir, "c.txt"]);
    if (UFile.exists([s_workingDir, "a.txt"]))
        throw Error("[UFile.mv] destination file by mv was not found.");
    if (!UFile.exists([s_workingDir, "c.txt"]))
        throw Error("[UFile.mv] the file to be moved remained in the same path.");
}
function test_reserveFilePath(): void {
    let fname = UFile.reserveFilePath(s_workingDir, "d.txt");
    if (fname != UFile.joinPath(s_workingDir, "d.txt"))
        throw Error(`[UFile.reserveFilePath] returned fname with a non needed change. => ${fname}`);
    fname = UFile.reserveFilePath(s_workingDir, "c.txt");
    if (fname != UFile.joinPath(s_workingDir, "c.txt.1"))
        throw Error(`[UFile.reserveFilePath] fname was not incremented properly. => ${fname}`);
}

export function T_U_File(): void {
    test_joinPath();
    initialize();
    try {
        test_write();
        test_read();
        test_cp();
        test_mv();
        test_reserveFilePath();
    } finally {
        finalize();
    }
    console.log("tests in T_U_File completed.");
}
