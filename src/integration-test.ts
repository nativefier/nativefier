import * as fs from 'fs';
import * as path from 'path';

import * as tmp from 'tmp';
tmp.setGracefulCleanup();

import { buildMain } from './main';

function checkApp(appPath: string, inputOptions) {
  let relPathToConfig: string;

  switch (inputOptions.platform) {
    case 'darwin':
      relPathToConfig = path.join(
        'google-test-app.app',
        'Contents/Resources/app',
      );
      break;
    case 'linux':
      relPathToConfig = 'resources/app';
      break;
    case 'win32':
      relPathToConfig = 'resources/app';
      break;
    default:
      throw new Error('Unknown app platform');
  }

  const nativefierConfigPath = path.join(
    appPath,
    relPathToConfig,
    'nativefier.json',
  );
  const nativefierConfig = JSON.parse(
    fs.readFileSync(nativefierConfigPath).toString(),
  );

  expect(inputOptions.targetUrl).toBe(nativefierConfig.targetUrl);
  // app name is not consistent for linux
  // assert.strictEqual(inputOptions.appName, nativefierConfig.name,
  // 'Packaged app must have the same name as the input parameters');
}

describe('Nativefier', () => {
  jest.setTimeout(240000);

  test('builds a Nativefier app for several platforms', async () => {
    for (const platform of ['darwin', 'linux']) {
      const tempDirectory = tmp.dirSync({ unsafeCleanup: true });
      const options = {
        name: 'google-test-app',
        targetUrl: 'https://google.com/',
        out: tempDirectory.name,
        overwrite: true,
        platform,
      };
      const appPath = await buildMain(options);
      checkApp(appPath, options);
    }
  });
});
