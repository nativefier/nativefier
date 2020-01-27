import { userAgent } from './userAgent';
import { inferUserAgent } from '../../infer/inferUserAgent';

jest.mock('./../../infer/inferUserAgent');

test('when a userAgent parameter is passed', async () => {
  expect(inferUserAgent).toHaveBeenCalledTimes(0);

  const params = { userAgentString: 'valid user agent' };
  await expect(userAgent(params)).resolves.toBe(params.userAgentString);
});

test('no userAgent parameter is passed', async () => {
  const params = { electronVersion: '123', platform: 'mac' };
  await userAgent(params);
  expect(inferUserAgent).toHaveBeenCalledWith(
    params.electronVersion,
    params.platform,
  );
});
