import { isArgFormatInvalid, isGistRawUrl } from './helpers';

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

  test('is true for valid raw gist url', () => {
    expect(
      isGistRawUrl(
        'https://gist.githubusercontent.com/vviikk/39cb5208694094b1930190c3c90a3255/raw/209a710bdad81a068f70667732511d91992f48bb/smooth-scrolling.js',
      ),
    ).toBe(true);
  });

  test('is false for gist url that isnt raw or not gist URL', () => {
    expect(
      isGistRawUrl(
        'https://gist.github.com/vviikk/39cb5208694094b1930190c3c90a3255',
      ),
    ).toBe(false);

    expect(
      isGistRawUrl(
        'https://someurl.com/gist/github/39cb5208694094b1930190c3c90a3255',
      ),
    ).toBe(false);
  });
});
