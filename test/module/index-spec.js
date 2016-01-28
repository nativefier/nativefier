import tmp from 'tmp';
import chai from 'chai';
import fs from 'fs';
import path from 'path';
import nativefier from './../../lib/index';
import _ from 'lodash';
import async from 'async';

let assert = chai.assert;

const PLATFORMS = ['darwin', 'linux', 'win32'];

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
                throw 'Unknown app platform';
        }

        const nativefierConfigPath = path.join(appPath, relPathToConfig, 'nativefier.json');
        const nativefierConfig = JSON.parse(fs.readFileSync(nativefierConfigPath));

        assert.strictEqual(inputOptions.targetUrl, nativefierConfig.targetUrl, 'Packaged app must have the same targetUrl as the input parameters');
        // app name is not consistent for linux
        // assert.strictEqual(inputOptions.appName, nativefierConfig.name, 'Packaged app must have the same name as the input parameters');
        callback();
    } catch (exception) {
        callback(exception);
    }
}

describe('Nativefier Module', function() {
    this.timeout(30000);
    it('Can build an app from a target url', function(done) {

        var tmpObj = tmp.dirSync({unsafeCleanup: true});
        after(function() {
            tmpObj.removeCallback();
        });

        const tmpPath = tmpObj.name;
        const options = {
            appName: 'google-test-app',
            targetUrl: 'http://google.com',
            outDir: tmpPath,
            overwrite: true,
            platform: null
        };

        async.each(PLATFORMS, (platform, callback) => {
            let platformOptions = _.clone(options);
            platformOptions.platform = platform;
            nativefier(platformOptions, (error, appPath) => {
                if (error) {
                    callback(error);
                    return;
                }

                checkApp(appPath, platformOptions, error => {
                    callback(error);
                });
            });
        }, error => {
            done(error);
        });
    });
});
