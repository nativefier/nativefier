import log from 'loglevel';
import icon from './icon';
import { inferIcon } from '../../infer';

jest.mock('./../../infer/inferIcon');
jest.mock('loglevel');

const mockedResult = 'icon path';

describe('when the icon parameter is passed', () => {
  test('it should return the icon parameter', async () => {
    expect(inferIcon).toHaveBeenCalledTimes(0);

    const params = { icon: './icon.png' };
    await expect(icon(params)).resolves.toBe(params.icon);
  });
});

describe('when the icon parameter is not passed', () => {
  test('it should call inferIcon', async () => {
    inferIcon.mockImplementationOnce(() => Promise.resolve(mockedResult));
    const params = { targetUrl: 'some url', platform: 'mac' };

    const result = await icon(params);

    expect(result).toBe(mockedResult);
    expect(inferIcon).toHaveBeenCalledWith(params.targetUrl, params.platform);
  });

  describe('when inferIcon resolves with an error', () => {
    test('it should handle the error', async () => {
      inferIcon.mockImplementationOnce(() =>
        Promise.reject(new Error('some error')),
      );
      const params = { targetUrl: 'some url', platform: 'mac' };

      const result = await icon(params);
      expect(result).toBe(null);
      expect(inferIcon).toHaveBeenCalledWith(params.targetUrl, params.platform);
      expect(log.warn).toHaveBeenCalledTimes(1);
    });
  });
});
