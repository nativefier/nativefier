import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { DEFAULT_ELECTRON_VERSION } from './constants';
import { getTempDir } from './helpers/helpers';
import { getChromeVersionForElectronVersion } from './infer/browsers/inferChromeVersion';
import { getLatestFirefoxVersion } from './infer/browsers/inferFirefoxVersion';
import { getLatestSafariVersion } from './infer/browsers/inferSafariVersion';
import { inferArch } from './infer/inferOs';
import { buildNativefierApp } from './main';
import { userAgent } from './options/fields/userAgent';
import {
  GlobalShortcut,
  NativefierOptions,
  RawOptions,
} from '../shared/src/options/model';
import { parseJson } from './utils/parseUtils';

async function checkApp(
  appRoot: string,
  inputOptions: RawOptions,
): Promise<void> {
  const arch = inputOptions.arch ? inputOptions.arch : inferArch();
  if (inputOptions.out !== undefined) {
    expect(
      path.join(
        inputOptions.out,
        `npm-${inputOptions.platform as string}-${arch}`,
      ),
    ).toBe(appRoot);
  }

  let relativeResourcesDir = 'resources';

  if (inputOptions.platform === 'darwin') {
    relativeResourcesDir = path.join('npm.app', 'Contents', 'Resources');
  }

  const appPath = path.join(appRoot, relativeResourcesDir, 'app');

  const configPath = path.join(appPath, 'nativefier.json');
  const nativefierConfig: NativefierOptions | undefined =
    parseJson<NativefierOptions>(fs.readFileSync(configPath).toString());
  expect(nativefierConfig).not.toBeUndefined();

  expect(inputOptions.targetUrl).toBe(nativefierConfig?.targetUrl);

  // Test name inferring
  expect(nativefierConfig?.name).toBe('npm');

  // Test icon writing
  const iconFile =
    inputOptions.platform === 'darwin'
      ? path.join('..', 'electron.icns')
      : inputOptions.platform === 'linux'
      ? 'icon.png'
      : 'icon.ico';
  const iconPath = path.join(appPath, iconFile);
  expect(fs.existsSync(iconPath)).toEqual(true);
  expect(fs.statSync(iconPath).size).toBeGreaterThan(1000);

  // Test arch
  if (inputOptions.arch !== undefined) {
    expect(inputOptions.arch).toEqual(nativefierConfig?.arch);
  } else {
    expect(os.arch()).toEqual(nativefierConfig?.arch);
  }

  // Test electron version
  expect(nativefierConfig?.electronVersionUsed).toBe(
    inputOptions.electronVersion || DEFAULT_ELECTRON_VERSION,
  );

  // Test user agent
  if (inputOptions.userAgent) {
    const translatedUserAgent = await userAgent({
      packager: {
        platform: inputOptions.platform,
        electronVersion:
          inputOptions.electronVersion || DEFAULT_ELECTRON_VERSION,
      },
      nativefier: { userAgent: inputOptions.userAgent },
    });
    inputOptions.userAgent = translatedUserAgent || inputOptions.userAgent;
  }

  expect(nativefierConfig?.userAgent).toEqual(inputOptions.userAgent);

  // Test lang
  expect(nativefierConfig?.lang).toEqual(inputOptions.lang);

  // Test global shortcuts
  if (inputOptions.globalShortcuts) {
    let shortcutData: GlobalShortcut[] | undefined = [];

    if (typeof inputOptions.globalShortcuts === 'string') {
      shortcutData = parseJson<GlobalShortcut[]>(
        fs.readFileSync(inputOptions.globalShortcuts, 'utf8'),
      );
    } else {
      shortcutData = inputOptions.globalShortcuts;
    }

    expect(nativefierConfig?.globalShortcuts).toStrictEqual(shortcutData);
  }
}

describe('Nativefier', () => {
  jest.setTimeout(300000);

  test.each(['darwin', 'linux'])(
    'builds a Nativefier app for platform %s',
    async (platform) => {
      const tempDirectory = getTempDir('integtest');
      const options: RawOptions = {
        lang: 'en-US',
        out: tempDirectory,
        overwrite: true,
        platform,
        targetUrl: 'https://npmjs.com/',
      };
      const appPath = await buildNativefierApp(options);
      expect(appPath).not.toBeUndefined();
      await checkApp(appPath, options);
    },
  );
});

function generateShortcutsFile(dir: string): string {
  const shortcuts = [
    {
      key: 'MediaPlayPause',
      inputEvents: [
        {
          type: 'keyDown',
          keyCode: 'Space',
        },
      ],
    },
    {
      key: 'MediaNextTrack',
      inputEvents: [
        {
          type: 'keyDown',
          keyCode: 'Right',
        },
      ],
    },
  ];

  const filename = path.join(dir, 'shortcuts.json');
  fs.writeFileSync(filename, JSON.stringify(shortcuts));

  return filename;
}

describe('Nativefier upgrade', () => {
  jest.setTimeout(300000);

  test.each([
    { platform: 'darwin', arch: 'x64' },
    { platform: 'linux', arch: 'arm64', userAgent: 'FIREFOX 60' },
    // Exhaustive integration testing here would be neat, but takes too long.
    // -> For now, only testing a subset of platforms/archs
    // { platform: 'win32', arch: 'x64' },
    // { platform: 'darwin', arch: 'arm64' },
    // { platform: 'linux', arch: 'x64' },
    // { platform: 'linux', arch: 'armv7l' },
  ])(
    'can upgrade a Nativefier app for platform/arch: %s',
    async (baseAppOptions) => {
      const tempDirectory = getTempDir('integtestUpgrade1');
      const shortcuts = generateShortcutsFile(tempDirectory);
      const options: RawOptions = {
        electronVersion: '11.2.3',
        globalShortcuts: shortcuts,
        out: tempDirectory,
        overwrite: true,
        targetUrl: 'https://npmjs.com/',
        ...baseAppOptions,
      };
      const appPath = await buildNativefierApp(options);
      expect(appPath).not.toBeUndefined();
      await checkApp(appPath, options);

      const upgradeOptions: RawOptions = {
        upgrade: appPath,
        overwrite: true,
      };

      const upgradeAppPath = await buildNativefierApp(upgradeOptions);
      options.electronVersion = DEFAULT_ELECTRON_VERSION;
      options.userAgent = baseAppOptions.userAgent;
      expect(upgradeAppPath).not.toBeUndefined();
      await checkApp(upgradeAppPath, options);
    },
  );
});

describe('Browser version retrieval', () => {
  test('get chrome version with electron version', async () => {
    await expect(getChromeVersionForElectronVersion('12.0.0')).resolves.toBe(
      '89.0.4389.69',
    );
  });

  test('get latest firefox version', async () => {
    const firefoxVersion = await getLatestFirefoxVersion();

    const majorVersion = parseInt(firefoxVersion.split('.')[0]);
    expect(majorVersion).toBeGreaterThanOrEqual(88);
  });

  test('get latest safari version', async () => {
    const safariVersion = await getLatestSafariVersion();

    expect(safariVersion.majorVersion).toBeGreaterThanOrEqual(14);
  });
});
