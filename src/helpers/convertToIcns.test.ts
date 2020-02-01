import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { convertToIcns } from './convertToIcns';

// Prerequisite for test: to use OSX with sips, iconutil and imagemagick convert

function testConvertPng(pngName) {
  if (os.platform() !== 'darwin') {
    // Skip png conversion tests, OSX is required
    return Promise.resolve();
  }

  return new Promise((resolve, reject) =>
    convertToIcns(
      path.join(__dirname, '../../', 'test-resources', pngName),
      (error, icnsPath) => {
        if (error) {
          reject(error);
          return;
        }

        const stat = fs.statSync(icnsPath);

        expect(stat.isFile()).toBe(true);
        resolve();
      },
    ),
  );
}

describe('Get Icon Module', () => {
  test('Can convert a rgb png to icns', async () => {
    await testConvertPng('iconSample.png');
  });

  test('Can convert a grey png to icns', async () => {
    await testConvertPng('iconSampleGrey.png');
  });
});
