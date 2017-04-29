import chai from 'chai';
import _ from 'lodash';
import inferUserAgent from './../../lib/infer/inferUserAgent';

const assert = chai.assert;

const TEST_RESULT = {
  darwin: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
  win32: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
  linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
};

function testPlatform(platform) {
  return inferUserAgent('0.37.1', platform)
        .then((userAgent) => {
          assert.equal(userAgent, TEST_RESULT[platform], 'Correct user agent should be inferred');
        });
}

describe('Infer User Agent', function () {
  this.timeout(15000);
  it('Can infer userAgent for all platforms', (done) => {
    const testPromises = _.keys(TEST_RESULT).map(platform => testPlatform(platform));
    Promise
            .all(testPromises)
            .then(() => {
              done();
            })
            .catch((error) => {
              done(error);
            });
  });

  it('Connection error will still get a user agent', (done) => {
    const TIMEOUT_URL = 'http://www.google.com:81/';
    inferUserAgent('1.6.7', 'darwin', TIMEOUT_URL)
            .then((userAgent) => {
              assert.equal(
                    userAgent,
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
                    'Expect default user agent on connection error',
                );
              done();
            })
            .catch(done);
  });
});
