import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { DEFAULT_ELECTRON_VERSION } from './constants';
import { getTempDir } from './helpers/helpers';
import { inferArch } from './infer/inferOs';
import { inferUserAgent } from './infer/inferUserAgent';
import { buildNativefierApp } from './main';

async function checkApp(appRoot: string, inputOptions: any): Promise<void> {
  const arch = (inputOptions.arch as string) || inferArch();
  if (inputOptions.out !== undefined) {
    expect(
      path.join(
        inputOptions.out,
        `Google-${inputOptions.platform as string}-${arch}`,
      ),
    ).toBe(appRoot);
  }

  let relativeAppFolder: string;

  switch (inputOptions.platform) {
    case 'darwin':
      relativeAppFolder = path.join('Google.app', 'Contents/Resources/app');
      break;
    case 'linux':
      relativeAppFolder = 'resources/app';
      break;
    case 'win32':
      relativeAppFolder = 'resources/app';
      break;
    default:
      throw new Error(
        `Unknown app platform: ${new String(inputOptions.platform).toString()}`,
      );
  }

  const appPath = path.join(appRoot, relativeAppFolder);

  const configPath = path.join(appPath, 'nativefier.json');
  const nativefierConfig = JSON.parse(fs.readFileSync(configPath).toString());
  expect(inputOptions.targetUrl).toBe(nativefierConfig.targetUrl);

  // Test name inferring
  expect(nativefierConfig.name).toBe('Google');

  // Test icon writing
  const iconFile =
    inputOptions.platform === 'darwin' ? '../electron.icns' : 'icon.png';
  const iconPath = path.join(appPath, iconFile);
  expect(fs.existsSync(iconPath)).toBe(true);
  expect(fs.statSync(iconPath).size).toBeGreaterThan(1000);

  // Test arch
  if (inputOptions.arch !== undefined) {
    expect(inputOptions.arch).toBe(nativefierConfig.arch);
  } else {
    expect(os.arch()).toBe(nativefierConfig.arch);
  }

  // Test electron version
  expect(nativefierConfig.electronVersionUsed).toBe(
    inputOptions.electronVersion || DEFAULT_ELECTRON_VERSION,
  );

  // Test user agent
  expect(nativefierConfig.userAgent).toBe(
    inputOptions.userAgent !== undefined
      ? inputOptions.userAgent
      : await inferUserAgent(
          inputOptions.electronVersion || DEFAULT_ELECTRON_VERSION,
          inputOptions.platform,
        ),
  );
}

describe('Nativefier', () => {
  jest.setTimeout(300000);

  test.each(['darwin', 'linux'])(
    'builds a Nativefier app for platform %s',
    async (platform) => {
      const tempDirectory = getTempDir('integtest');
      const options = {
        targetUrl: 'https://google.com/',
        out: tempDirectory,
        overwrite: true,
        platform,
      };
      const appPath = await buildNativefierApp(options);
      await checkApp(appPath, options);
    },
  );
});

describe('Nativefier upgrade', () => {
  jest.setTimeout(300000);

  test.each([
    { platform: 'darwin', arch: 'x64' },
    { platform: 'linux', arch: 'arm64', userAgent: 'FIREFOX' },
    // Exhaustive integration testing here would be neat, but takes too long.
    // -> For now, only testing a subset of platforms/archs
    // { platform: 'win32', arch: 'x64' },
    // { platform: 'win32', arch: 'ia32' },
    // { platform: 'darwin', arch: 'arm64' },
    // { platform: 'linux', arch: 'x64' },
    // { platform: 'linux', arch: 'armv7l' },
    // { platform: 'linux', arch: 'ia32' },
  ])(
    'can upgrade a Nativefier app for platform/arch: %s',
    async (baseAppOptions) => {
      const tempDirectory = getTempDir('integtestUpgrade1');
      const options = {
        targetUrl: 'https://google.com/',
        out: tempDirectory,
        overwrite: true,
        electronVersion: '11.2.3',
        ...baseAppOptions,
      };
      const appPath = await buildNativefierApp(options);
      await checkApp(appPath, options);

      const upgradeOptions = {
        upgrade: appPath,
        overwrite: true,
      };

      const upgradeAppPath = await buildNativefierApp(upgradeOptions);
      options.electronVersion = DEFAULT_ELECTRON_VERSION;
      options.userAgent =
        baseAppOptions.userAgent !== undefined
          ? baseAppOptions.userAgent
          : await inferUserAgent(
              DEFAULT_ELECTRON_VERSION,
              baseAppOptions.platform,
            );
      await checkApp(upgradeAppPath, options);
    },
  );
});
