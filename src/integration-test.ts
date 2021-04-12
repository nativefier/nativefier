import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { getTempDir } from './helpers/helpers';
import { buildNativefierApp } from './main';

function checkApp(appRoot: string, inputOptions: any): void {
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

  if (inputOptions.arch !== undefined) {
    expect(inputOptions.arch).toBe(nativefierConfig.arch);
  } else {
    expect(os.arch()).toBe(nativefierConfig.arch);
  }
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
      checkApp(appPath, options);
    },
  );
});

describe('Nativefier upgrade', () => {
  jest.setTimeout(300000);

  test.each([
    { platform: 'darwin', arch: 'arm64' },
    { platform: 'linux', arch: 'x64' },
    // Exhaustive integration testing here would be neat, but takes too long.
    // -> For now, only testing a subset of platforms/archs
    // { platform: 'win32', arch: 'x64' },
    // { platform: 'darwin', arch: 'x64' },
    // { platform: 'linux', arch: 'arm64' },
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
        ...baseAppOptions,
      };
      const appPath = await buildNativefierApp(options);

      const tempDirectoryUpgrade = getTempDir('integtestUpgrade2');
      const upgradeOptions = {
        upgrade: appPath,
        out: tempDirectoryUpgrade,
        overwrite: true,
      };

      const upgradeAppPath = await buildNativefierApp(upgradeOptions);
      checkApp(upgradeAppPath, options);
    },
  );
});
