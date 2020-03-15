import { sanitizeFilename } from './sanitizeFilename';
import { DEFAULT_APP_NAME } from '../constants';

describe('replacing non ascii characters', () => {
  const nonAscii = '�';
  test('it should return a result without non ascii characters', () => {
    const param = `${nonAscii}abc`;
    const expectedResult = 'abc';
    const result = sanitizeFilename('', param);
    expect(result).toBe(expectedResult);
  });

  describe('when the result of replacing these characters is empty', () => {
    const result = sanitizeFilename('', nonAscii);
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
