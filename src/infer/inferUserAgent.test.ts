import { inferUserAgent } from './inferUserAgent';
import { DEFAULT_ELECTRON_VERSION, DEFAULT_CHROME_VERSION } from '../constants';

const EXPECTED_USERAGENTS = {
  darwin: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${DEFAULT_CHROME_VERSION} Safari/537.36`,
  mas: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${DEFAULT_CHROME_VERSION} Safari/537.36`,
  win32: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${DEFAULT_CHROME_VERSION} Safari/537.36`,
  linux: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${DEFAULT_CHROME_VERSION} Safari/537.36`,
};

describe('Infer User Agent', () => {
  // TODO make fast by mocking timeout.
  for (const [platform, archUa] of Object.entries(EXPECTED_USERAGENTS)) {
    test(`Can infer userAgent for ${platform}`, async () => {
      jest.setTimeout(10000);
      const ua = await inferUserAgent(DEFAULT_ELECTRON_VERSION, platform);
      expect(ua).toBe(archUa);
    });
  }

  // TODO make fast by mocking timeout, and un-skip
  test.skip('Connection error will still get a user agent', async () => {
    jest.setTimeout(6000);

    const TIMEOUT_URL = 'http://www.google.com:81/';
    await expect(inferUserAgent('1.6.7', 'darwin', TIMEOUT_URL)).resolves.toBe(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
    );
  });
});
