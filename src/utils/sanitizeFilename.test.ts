import { sanitizeFilename } from './sanitizeFilename';
import { DEFAULT_APP_NAME } from '../constants';

describe('replacing reserved characters', () => {
  const reserved = '\\/?*<>:|';

  test('it should return a result without reserved characters', () => {
    const expectedResult = 'abc';
    const param = `${reserved}${expectedResult}`;
    const result = sanitizeFilename('', param);
    expect(result).toBe(expectedResult);
  });

  test('it should allow non-ascii characters', () => {
    const expectedResult = '微信读书';
    const param = `${reserved}${expectedResult}`;
    const result = sanitizeFilename('', param);
    expect(result).toBe(expectedResult);
  });

  test('when the result of replacing these characters is empty, use default', () => {
    const result = sanitizeFilename('', reserved);
    expect(result).toBe(DEFAULT_APP_NAME);
  });
});

describe('when the platform is linux', () => {
  test('it should return a name without spaces', () => {
    const param = 'some name';
    const expectedResult = 'somename';
    const result = sanitizeFilename('linux', param);
    expect(result).toBe(expectedResult);
  });
});
