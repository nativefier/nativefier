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
  return inferUserAgent('0.37.1', platform).then((userAgent) => {
    expect(userAgent).toBe(TEST_RESULT[platform]);
  });
}

describe('Infer User Agent', () => {
  test('Can infer userAgent for all platforms', (done) => {
    const testPromises = _.keys(TEST_RESULT).map(platform => testPlatform(platform));
    Promise.all(testPromises)
      .then(() => {
        done();
      })
      .catch((error) => {
        done(error);
      });
  });

  test('Connection error will still get a user agent', (done) => {
    jest.setTimeout(6000);

    const TIMEOUT_URL = 'http://www.google.com:81/';
    inferUserAgent('1.6.7', 'darwin', TIMEOUT_URL)
      .then((userAgent) => {
        expect(userAgent).toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');
        done();
      })
      .catch(done);
  });
});
