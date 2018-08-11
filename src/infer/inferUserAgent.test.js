import _ from 'lodash';
import inferUserAgent from './inferUserAgent';

const TEST_RESULT = {
  darwin:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
  mas:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
  win32:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
  linux:
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
};

function testPlatform(platform) {
  return expect(inferUserAgent('0.37.1', platform)).resolves.toBe(
    TEST_RESULT[platform],
  );
}

describe('Infer User Agent', () => {
  test('Can infer userAgent for all platforms', async () => {
    const testPromises = _.keys(TEST_RESULT).map((platform) =>
      testPlatform(platform),
    );
    await Promise.all(testPromises);
  });

  test('Connection error will still get a user agent', async () => {
    jest.setTimeout(6000);

    const TIMEOUT_URL = 'http://www.google.com:81/';
    await expect(inferUserAgent('1.6.7', 'darwin', TIMEOUT_URL)).resolves.toBe(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    );
  });
});
