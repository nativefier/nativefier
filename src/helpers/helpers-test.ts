import { isArgFormatValid } from './helpers';

const shortArg = '-t';
const longArg = '--test';
const extraLongArg = '--test-run';
const invalidShortArg = '--t';
const invalidLongArg = '-test';

test('isArgFormatValid should return true for short arguments', () => {
  expect(isArgFormatValid(shortArg)).toEqual(true);
});

test('isArgFormatValid should return true for long arguments', () => {
  expect(isArgFormatValid(longArg)).toEqual(true);
});

test('isArgFormatValid should return true for extra long arguments', () => {
  expect(isArgFormatValid(extraLongArg)).toEqual(true);
});

test('isArgFormatValid should return false for improperly formatted short arguments', () => {
  expect(isArgFormatValid(invalidShortArg)).toEqual(false);
});

test('isArgFormatValid should return false for improperly formatted long arguments', () => {
  expect(isArgFormatValid(invalidLongArg)).toEqual(false);
});
