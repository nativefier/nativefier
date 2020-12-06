import { isArgFormatValid } from './helpers';

describe('isArgFormatValid', () => {
  test('is true for short arguments', () => {
    expect(isArgFormatValid('-t')).toBe(true);
  });

  test('is false for improperly formatted short arguments', () => {
    expect(isArgFormatValid('--t')).toBe(false);
  });

  test('is true for long arguments', () => {
    expect(isArgFormatValid('--test')).toBe(true);
  });

  test('is false for improperly formatted long arguments', () => {
    expect(isArgFormatValid('---test')).toBe(false);
  });

  test('is false for improperly formatted long arguments', () => {
    expect(isArgFormatValid('-test')).toBe(false);
  });

  test('is true for long arguments with dashes', () => {
    expect(isArgFormatValid('--test-run')).toBe(true);
  });

  test('is false for improperly formatted long arguments with dashes', () => {
    expect(isArgFormatValid('--test--run')).toBe(false);
  });

  test('is true for long arguments with many dashes', () => {
    expect(isArgFormatValid('--test-run-with-many-dashes')).toBe(true);
  });

  test('is false for improperly formatted excessively long arguments', () => {
    expect(isArgFormatValid('--test--run--with--many--dashes')).toBe(false);
  });
});
