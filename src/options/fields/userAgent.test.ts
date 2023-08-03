import { getChromeVersionForElectronVersion } from '../../infer/browsers/inferChromeVersion';
import { getLatestFirefoxVersion } from '../../infer/browsers/inferFirefoxVersion';
import { getLatestSafariVersion } from '../../infer/browsers/inferSafariVersion';
import { userAgent } from './userAgent';

jest.mock('./../../infer/browsers/inferChromeVersion');
jest.mock('./../../infer/browsers/inferFirefoxVersion');
jest.mock('./../../infer/browsers/inferSafariVersion');

test('when a userAgent parameter is passed', async () => {
  const params = {
    packager: {},
    nativefier: { userAgent: 'valid user agent' },
  };
  await expect(userAgent(params)).resolves.toBeUndefined();
});

test('no userAgent parameter is passed', async () => {
  const params = {
    packager: { platform: 'mac' },
    nativefier: {},
  };
  await expect(userAgent(params)).resolves.toBeUndefined();
});

test('edge userAgent parameter is passed', async () => {
  (getChromeVersionForElectronVersion as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve('99.0.0'),
  );
  const params = {
    packager: { platform: 'darwin' },
    nativefier: { userAgent: 'edge' },
  };

  const parsedUserAgent = await userAgent(params);

  expect(parsedUserAgent).not.toBe(params.nativefier.userAgent);
  expect(parsedUserAgent).toContain('Edg/99.0.0');
});

test('firefox userAgent parameter is passed', async () => {
  (getLatestFirefoxVersion as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve('100.0.0'),
  );
  const params = {
    packager: { platform: 'win32' },
    nativefier: { userAgent: 'firefox' },
  };

  const parsedUserAgent = await userAgent(params);

  expect(parsedUserAgent).not.toBe(params.nativefier.userAgent);
  expect(parsedUserAgent).toContain('Firefox/100.0.0');
});

test('safari userAgent parameter is passed', async () => {
  (getLatestSafariVersion as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve({
      majorVersion: 101,
      version: '101.0.0',
      webkitVersion: '600.0.0.0',
    }),
  );
  const params = {
    packager: { platform: 'linux' },
    nativefier: { userAgent: 'safari' },
  };

  const parsedUserAgent = await userAgent(params);

  expect(parsedUserAgent).not.toBe(params.nativefier.userAgent);
  expect(parsedUserAgent).toContain('Version/101.0.0 Safari');
});

test('short userAgent parameter is passed with an electronVersion', async () => {
  (getChromeVersionForElectronVersion as jest.Mock).mockImplementationOnce(() =>
    Promise.resolve('102.0.0'),
  );

  const params = {
    packager: { electronVersion: '16.0.0', platform: 'darwin' },
    nativefier: { userAgent: 'edge' },
  };

  const parsedUserAgent = await userAgent(params);

  expect(parsedUserAgent).not.toBe(params.nativefier.userAgent);
  expect(parsedUserAgent).toContain('102.0.0');
  expect(getChromeVersionForElectronVersion).toHaveBeenCalledWith('16.0.0');
});
