// need to subtract 2 from source maps
import 'source-map-support/register';

import chai from 'chai';
import fs from 'fs';
import os from 'os';
import path from 'path';
import pngToIcns from './../../lib/pngToIcns';

let assert = chai.assert;

// Prerequisite for test: to use OSX with sips, iconutil and imagemagick convert

function testConvertPng(pngName, done) {
    if (os.platform() !== 'darwin') {
        console.warn('Skipping png conversion tests, OSX is required');
        done();
    }
    pngToIcns(path.join(__dirname, '../../', 'test-resources', pngName), (error, icnsPath) => {
        if (error) {
            done(error);
            return;
        }

        let stat = fs.statSync(icnsPath);
        assert.isTrue(stat.isFile(), 'Output icns file should be a path');
        done();
    });
}

describe('Get Icon Module', function() {
    it('Can convert a rgb png to icns', function(done) {
        testConvertPng('iconSample.png', done);
    });

    it('Can convert a grey png to icns', function(done) {
        testConvertPng('iconSampleGrey.png', done);
    });
});
