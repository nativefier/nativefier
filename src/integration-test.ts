import * as fs from 'fs';
import * as path from 'path';

import * as async from 'async';
import * as tmp from 'tmp';
tmp.setGracefulCleanup();

import { buildMain } from './index';

const PLATFORMS = ['darwin', 'linux'];

function checkApp(appPath: string, inputOptions, callback) {
  try {
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
    callback();
  } catch (exception) {
    callback(exception);
  }
}

describe('Nativefier', () => {
  jest.setTimeout(240000);

  test('can build an app from a target url', (done) => {
    async.eachSeries(
      PLATFORMS,
      (platform, callback) => {
        const tempDirectory = tmp.dirSync({ unsafeCleanup: true });

        const tmpPath = tempDirectory.name;
        const options = {
          name: 'google-test-app',
          targetUrl: 'https://google.com',
          out: tmpPath,
          overwrite: true,
          platform,
        };
        buildMain(options, (error, appPath) => {
          if (error) {
            callback(error);
            return;
          }

          checkApp(appPath, options, (err) => {
            callback(err);
          });
        });
      },
      (error) => {
        done(error);
      },
    );
  });
});
