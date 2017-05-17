import sanitizeFilenameLib from 'sanitize-filename';
import sanitizeFilename from './sanitizeFilename';
import { DEFAULT_APP_NAME } from './../constants';

jest.mock('sanitize-filename');
sanitizeFilenameLib.mockImplementation(str => str);

test('it should call the sanitize-filename npm module', () => {
  const param = 'abc';
  sanitizeFilename('', param);
  expect(sanitizeFilenameLib).toHaveBeenCalledWith(param);
});

describe('replacing non ascii characters', () => {
  const nonAscii = '�';
  test('it should return a result without non ascii cahracters', () => {
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
  test('it should return a kebab cased name', () => {
    const param = 'some name';
    const expectedResult = 'some-name';
    const result = sanitizeFilename('linux', param);
    expect(result).toBe(expectedResult);
  });
});
