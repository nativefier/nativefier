import { isArgFormatValid } from './helpers';

test('isArgFormatValid should return true for short arguments', () => {
  expect(isArgFormatValid('-t')).toEqual(true);
});

test('isArgFormatValid should return true for long arguments', () => {
  expect(isArgFormatValid('--test')).toEqual(true);
});

test('isArgFormatValid should return true for extra long arguments', () => {
  expect(isArgFormatValid('--test-run')).toEqual(true);
});

test('isArgFormatValid should return true for extra long arguments', () => {
  expect(isArgFormatValid('--test-run-with-multiple-dashes')).toEqual(true);
});

test('isArgFormatValid should return false for improperly formatted short arguments', () => {
  expect(isArgFormatValid('--t')).toEqual(false);
});

test('isArgFormatValid should return false for improperly formatted long arguments', () => {
  expect(isArgFormatValid('---test')).toEqual(false);
});

test('isArgFormatValid should return false for improperly formatted long arguments', () => {
  expect(isArgFormatValid('-test')).toEqual(false);
});
