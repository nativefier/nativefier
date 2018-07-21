import userAgent from './userAgent';
import { inferUserAgent } from '../../infer';

jest.mock('./../../infer/inferUserAgent');

test('when a userAgent parameter is passed', async () => {
  expect(inferUserAgent).toHaveBeenCalledTimes(0);

  const params = { userAgent: 'valid user agent' };
  await expect(userAgent(params)).resolves.toBe(params.userAgent);
});

test('no userAgent parameter is passed', async () => {
  const params = { electronVersion: '123', platform: 'mac' };
  await userAgent(params);
  expect(inferUserAgent).toHaveBeenCalledWith(
    params.electronVersion,
    params.platform,
  );
});
