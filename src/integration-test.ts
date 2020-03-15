import * as fs from 'fs';
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
      throw new Error('Unknown app platform');
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
}

describe('Nativefier', () => {
  jest.setTimeout(300000);

  test('builds a Nativefier app for several platforms', async () => {
    for (const platform of ['darwin', 'linux']) {
      const tempDirectory = getTempDir('integtest');
      const options = {
        targetUrl: 'https://google.com/',
        out: tempDirectory,
        overwrite: true,
        platform,
      };
      const appPath = await buildNativefierApp(options);
      checkApp(appPath, options);
    }
  });
});
