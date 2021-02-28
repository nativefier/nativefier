import * as fs from 'fs';
import * as path from 'path';
import { getTempDir } from './helpers/helpers';
import { buildNativefierApp } from './main';

function checkApp(appRoots: string[], inputOptions: any): void {
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

  const appPaths = appRoots.map((appRoot) =>
    path.join(appRoot, relativeAppFolder),
  );

  const configPaths = appPaths.map((appPath) =>
    path.join(appPath, 'nativefier.json'),
  );
  const nativefierConfigs = configPaths.map((configPath) =>
    JSON.parse(fs.readFileSync(configPath).toString()),
  );
  test.each(nativefierConfigs)('config is valid %p', (nativefierConfig) => {
    expect(inputOptions.targetUrl).toBe(nativefierConfig.targetUrl);
    // Test name inferring
    expect(nativefierConfig.name).toBe('Google');
  });

  // Test icon writing
  const iconFile =
    inputOptions.platform === 'darwin' ? '../electron.icns' : 'icon.png';
  const iconPaths = appPaths.map((appPath) => path.join(appPath, iconFile));
  test.each(iconPaths)('icon path is valid %s', (iconPath) => {
    expect(fs.existsSync(iconPath)).toBe(true);
    expect(fs.statSync(iconPath).size).toBeGreaterThan(1000);
  });
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
      const appPaths = await buildNativefierApp(options);
      checkApp(appPaths, options);
    }
  });
});
