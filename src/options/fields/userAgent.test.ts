import { userAgent } from './userAgent';
import { inferUserAgent } from '../../infer/inferUserAgent';

jest.mock('./../../infer/inferUserAgent');

test('when a userAgent parameter is passed', async () => {
  expect(inferUserAgent).toHaveBeenCalledTimes(0);

  const params = {
    packager: {},
    nativefier: { userAgent: 'valid user agent' },
  };
  await expect(userAgent(params)).resolves.toBe(null);
});

test('no userAgent parameter is passed', async () => {
  const params = {
    packager: { electronVersion: '123', platform: 'mac' },
    nativefier: {},
  };
  await userAgent(params);
  expect(inferUserAgent).toHaveBeenCalledWith(
    params.packager.electronVersion,
    params.packager.platform,
  );
});
