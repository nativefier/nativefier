import log from 'loglevel';
import name from './name';
import { DEFAULT_APP_NAME } from './../../constants';
import { inferTitle } from './../../infer';
import { sanitizeFilename } from './../../utils';

jest.mock('./../../infer/inferTitle');
jest.mock('./../../utils/sanitizeFilename');
jest.mock('loglevel');

sanitizeFilename.mockImplementation((_, filename) => filename);

const mockedResult = 'mock name';

describe('well formed name parameters', () => {
  const params = { name: 'appname', platform: 'something' };
  test('it should not call inferTitle', () => name(params).then((result) => {
    expect(inferTitle).toHaveBeenCalledTimes(0);
    expect(result).toBe(params.name);
  }));

  test('it should call sanitize filename', () => name(params).then((result) => {
    expect(sanitizeFilename).toHaveBeenCalledWith(params.platform, result);
  }));
});

describe('bad name parameters', () => {
  beforeEach(() => {
    inferTitle.mockImplementationOnce(() => Promise.resolve(mockedResult));
  });

  const params = { targetUrl: 'some url' };
  describe('when the name is undefined', () => {
    test('it should call inferTitle', () => name(params).then(() => {
      expect(inferTitle).toHaveBeenCalledWith(params.targetUrl);
    }));
  });

  describe('when the name is an empty string', () => {
    test('it should call inferTitle', () => {
      const testParams = Object.assign({}, params, { name: '' });

      return name(testParams).then(() => {
        expect(inferTitle).toHaveBeenCalledWith(params.targetUrl);
      });
    });
  });

  test('it should call sanitize filename', () => name(params).then((result) => {
    expect(sanitizeFilename).toHaveBeenCalledWith(params.platform, result);
  }));
});

describe('handling inferTitle results', () => {
  const params = { targetUrl: 'some url', name: '', platform: 'something' };
  test('it should return the result from inferTitle', () => {
    inferTitle.mockImplementationOnce(() => Promise.resolve(mockedResult));

    return name(params).then((result) => {
      expect(result).toBe(mockedResult);
      expect(inferTitle).toHaveBeenCalledWith(params.targetUrl);
    });
  });

  describe('when the returned pageTitle is falsey', () => {
    test('it should return the default app name', () => {
      inferTitle.mockImplementationOnce(() => Promise.resolve(null));

      return name(params).then((result) => {
        expect(result).toBe(DEFAULT_APP_NAME);
        expect(inferTitle).toHaveBeenCalledWith(params.targetUrl);
      });
    });
  });

  describe('when inferTitle resolves with an error', () => {
    test('it should return the default app name', () => {
      inferTitle.mockImplementationOnce(() => Promise.reject('some error'));

      return name(params).then((result) => {
        expect(result).toBe(DEFAULT_APP_NAME);
        expect(inferTitle).toHaveBeenCalledWith(params.targetUrl);
        expect(log.warn).toHaveBeenCalledTimes(1);
      });
    });
  });
});
