import * as fs from 'fs';

export function dirExists(dirName: string): boolean {
  try {
    const dirStat = fs.statSync(dirName);
    return dirStat.isDirectory();
  } catch {
    return false;
  }
}

export function fileExists(fileName: string): boolean {
  try {
    const fileStat = fs.statSync(fileName);
    return fileStat.isFile();
  } catch {
    return false;
  }
}
