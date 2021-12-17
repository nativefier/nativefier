import * as os from 'os';
import * as path from 'path';
import { spawnSync } from 'child_process';

// A modification of https://github.com/electron/node-rcedit to support the retrieval
// of information.

export function getVersionString(
  executablePath: string,
  versionString: string,
): string | undefined {
  let rcedit = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'node_modules',
    'rcedit',
    'bin',
    process.arch === 'x64' ? 'rcedit-x64.exe' : 'rcedit.exe',
  );
  const args = [executablePath, `--get-version-string`, versionString];

  const spawnOptions = {
    env: { ...process.env },
  };

  // Use Wine on non-Windows platforms except for WSL, which doesn't need it
  if (process.platform !== 'win32' && !os.release().endsWith('Microsoft')) {
    args.unshift(rcedit);
    rcedit = process.arch === 'x64' ? 'wine64' : 'wine';
    // Suppress "fixme:" stderr log messages
    spawnOptions.env.WINEDEBUG = '-all';
  }
  try {
    const child = spawnSync(rcedit, args, spawnOptions);
    const result = child.output?.toString().split(',wine: ')[0];
    return result.startsWith(',') ? result.substr(1) : result;
  } catch {
    return undefined;
  }
}
