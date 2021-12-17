import { isArgFormatInvalid, generateRandomSuffix } from './helpers';

describe('isArgFormatInvalid', () => {
  test('is false for correct short args', () => {
    expect(isArgFormatInvalid('-t')).toBe(false);
  });

  test('is true for improperly double-dashed short args', () => {
    expect(isArgFormatInvalid('--t')).toBe(true);
  });

  test('is false for --x and --y (backwards compat, we should have made these short, oh well)', () => {
    expect(isArgFormatInvalid('--x')).toBe(false);
    expect(isArgFormatInvalid('--y')).toBe(false);
  });

  test('is false for correct long args', () => {
    expect(isArgFormatInvalid('--test')).toBe(false);
  });

  test('is true for improperly triple-dashed long args', () => {
    expect(isArgFormatInvalid('---test')).toBe(true);
  });

  test('is true for improperly single-dashed long args', () => {
    expect(isArgFormatInvalid('-test')).toBe(true);
  });

  test('is false for correct long args with dashes', () => {
    expect(isArgFormatInvalid('--test-run')).toBe(false);
  });

  test('is false for correct long args with many dashes', () => {
    expect(isArgFormatInvalid('--test-run-with-many-dashes')).toBe(false);
  });
});

describe('generateRandomSuffix', () => {
  test('is not empty', () => {
    expect(generateRandomSuffix()).not.toBe('');
  });

  test('is not null', () => {
    expect(generateRandomSuffix()).not.toBeNull();
  });

  test('is not undefined', () => {
    expect(generateRandomSuffix()).toBeDefined();
  });

  test('is different per call', () => {
    expect(generateRandomSuffix()).not.toBe(generateRandomSuffix());
  });

  test('respects the length param', () => {
    expect(generateRandomSuffix(10).length).toBe(10);
  });
});
