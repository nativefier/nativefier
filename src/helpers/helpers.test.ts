import { isArgFormatInvalid } from './helpers';

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
