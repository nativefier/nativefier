import fs from 'fs';
import os from 'os';
import path from 'path';
import convertToIcns from './convertToIcns';

// Prerequisite for test: to use OSX with sips, iconutil and imagemagick convert

function testConvertPng(pngName, done) {
  if (os.platform() !== 'darwin') {
    // Skip png conversion tests, OSX is required
    done();
    return;
  }

  convertToIcns(
    path.join(__dirname, '../../', 'test-resources', pngName),
    (error, icnsPath) => {
      if (error) {
        done(error);
        return;
      }

      const stat = fs.statSync(icnsPath);

      expect(stat.isFile()).toBe(true);
      done();
    },
  );
}

describe('Get Icon Module', () => {
  test('Can convert a rgb png to icns', (done) => {
    testConvertPng('iconSample.png', done);
  });

  test('Can convert a grey png to icns', (done) => {
    testConvertPng('iconSampleGrey.png', done);
  });
});
