import tmp from 'tmp';
import chai from 'chai';
import fs from 'fs';
import path from 'path';
import async from 'async';

import nativefier from './../../lib/index';

const PLATFORMS = ['darwin', 'linux'];
tmp.setGracefulCleanup();
const assert = chai.assert;

function checkApp(appPath, inputOptions, callback) {
  try {
    let relPathToConfig;

    switch (inputOptions.platform) {
      case 'darwin':
        relPathToConfig = path.join('google-test-app.app', 'Contents/Resources/app');
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

    const nativefierConfigPath = path.join(appPath, relPathToConfig, 'nativefier.json');
    const nativefierConfig = JSON.parse(fs.readFileSync(nativefierConfigPath));

    assert.strictEqual(inputOptions.targetUrl, nativefierConfig.targetUrl, 'Packaged app must have the same targetUrl as the input parameters');
        // app name is not consistent for linux
        // assert.strictEqual(inputOptions.appName, nativefierConfig.name,
        // 'Packaged app must have the same name as the input parameters');
    callback();
  } catch (exception) {
    callback(exception);
  }
}

describe('Nativefier Module', function () {
  this.timeout(240000);
  it('Can build an app from a target url', (done) => {
    async.eachSeries(PLATFORMS, (platform, callback) => {
      const tmpObj = tmp.dirSync({ unsafeCleanup: true });

      const tmpPath = tmpObj.name;
      const options = {
        name: 'google-test-app',
        targetUrl: 'http://google.com',
        out: tmpPath,
        overwrite: true,
        platform: null,
      };

      options.platform = platform;
      nativefier(options, (error, appPath) => {
        if (error) {
          callback(error);
          return;
        }

        checkApp(appPath, options, (error) => {
          callback(error);
        });
      });
    }, (error) => {
      done(error);
    });
  });
});

