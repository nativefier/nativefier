import tmp from 'tmp';
import chai from 'chai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import nativefier from './../../lib/index';

let assert = chai.assert;

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
        assert.strictEqual(inputOptions.appName, nativefierConfig.name, 'Packaged app must have the same name as the input parameters');
        callback();
    } catch (exception) {
        callback(exception);
    }
}

describe('Nativefier Module', function() {
    this.timeout(20000);
    it('Can build an app from a target url', function(done) {
        try {
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
                platform: 'win32'
            };
            nativefier(options, (error, appPath) => {
                if (error) {
                    done(error);
                    return;
                }

                checkApp(appPath, options, error => {
                    done(error);
                });
            });
        } catch (exception) {
            done(exception);
        }
    });
});
