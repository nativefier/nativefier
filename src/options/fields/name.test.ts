import * as log from 'loglevel';

import { name } from './name';
import { DEFAULT_APP_NAME } from '../../constants';
import { inferTitle } from '../../infer/inferTitle';
import { sanitizeFilename } from '../../utils/sanitizeFilename';

jest.mock('./../../infer/inferTitle');
jest.mock('./../../utils/sanitizeFilename');
jest.mock('loglevel');

const inferTitleMockedResult = 'mock name';
const NAME_PARAMS_PROVIDED = {
  packager: {
    name: 'appname',
    targetUrl: 'https://google.com',
    platform: 'linux',
  },
};
const NAME_PARAMS_NEEDS_INFER = {
  packager: {
    targetUrl: 'https://google.com',
    platform: 'mac',
  },
};
beforeAll(() => {
  (sanitizeFilename as jest.Mock).mockImplementation(
    (_, filename: string) => filename,
  );
});

describe('well formed name parameters', () => {
  test('it should not call inferTitle', async () => {
    const result = await name(NAME_PARAMS_PROVIDED);

    expect(inferTitle).toHaveBeenCalledTimes(0);
    expect(result).toBe(NAME_PARAMS_PROVIDED.packager.name);
  });

  test('it should call sanitize filename', async () => {
    const result = await name(NAME_PARAMS_PROVIDED);

    expect(sanitizeFilename).toHaveBeenCalledWith(
      NAME_PARAMS_PROVIDED.packager.platform,
      result,
    );
  });
});

describe('bad name parameters', () => {
  beforeEach(() => {
    (inferTitle as jest.Mock).mockResolvedValue(inferTitleMockedResult);
  });

  const params = { packager: { targetUrl: 'some url', platform: 'whatever' } };
  test('it should call inferTitle when the name is undefined', async () => {
    await name(params);
    expect(inferTitle).toHaveBeenCalledWith(params.packager.targetUrl);
  });

  test('it should call inferTitle when the name is an empty string', async () => {
    const testParams = {
      ...params,
      name: '',
    };

    await name(testParams);
    expect(inferTitle).toHaveBeenCalledWith(params.packager.targetUrl);
  });

  test('it should call sanitize filename', async () => {
    const result = await name(params);
    expect(sanitizeFilename).toHaveBeenCalledWith(
      params.packager.platform,
      result,
    );
  });
});

describe('handling inferTitle results', () => {
  test('it should return the result from inferTitle', async () => {
    const result = await name(NAME_PARAMS_NEEDS_INFER);

    expect(result).toEqual(inferTitleMockedResult);
    expect(inferTitle).toHaveBeenCalledWith(
      NAME_PARAMS_NEEDS_INFER.packager.targetUrl,
    );
  });

  test('it should return the default app name when the returned pageTitle is falsey', async () => {
    (inferTitle as jest.Mock).mockResolvedValue(null);
    const result = await name(NAME_PARAMS_NEEDS_INFER);

    expect(result).toEqual(DEFAULT_APP_NAME);
    expect(inferTitle).toHaveBeenCalledWith(
      NAME_PARAMS_NEEDS_INFER.packager.targetUrl,
    );
  });

  test('it should return the default app name when inferTitle rejects', async () => {
    (inferTitle as jest.Mock).mockRejectedValue('some error');
    const result = await name(NAME_PARAMS_NEEDS_INFER);

    expect(result).toEqual(DEFAULT_APP_NAME);
    expect(inferTitle).toHaveBeenCalledWith(
      NAME_PARAMS_NEEDS_INFER.packager.targetUrl,
    );
    expect(log.warn).toHaveBeenCalledTimes(1); // eslint-disable-line @typescript-eslint/unbound-method
  });
});
