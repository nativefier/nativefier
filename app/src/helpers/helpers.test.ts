import { linkIsInternal, getCounterValue, isArgFormatValid } from './helpers';

const internalUrl = 'https://medium.com/';
const internalUrlSubPath = 'topic/technology';
const externalUrl = 'https://www.wikipedia.org/wiki/Electron';
const wildcardRegex = /.*/;

test('the original url should be internal', () => {
  expect(linkIsInternal(internalUrl, internalUrl, undefined)).toEqual(true);
});

test('sub-paths of the original url should be internal', () => {
  expect(
    linkIsInternal(internalUrl, internalUrl + internalUrlSubPath, undefined),
  ).toEqual(true);
});

test("'about:blank' should be internal", () => {
  expect(linkIsInternal(internalUrl, 'about:blank', undefined)).toEqual(true);
});

test('urls from different sites should not be internal', () => {
  expect(linkIsInternal(internalUrl, externalUrl, undefined)).toEqual(false);
});

test('all urls should be internal with wildcard regex', () => {
  expect(linkIsInternal(internalUrl, externalUrl, wildcardRegex)).toEqual(true);
});

const smallCounterTitle = 'Inbox (11) - nobody@example.com - Gmail';
const largeCounterTitle = 'Inbox (8,756) - nobody@example.com - Gmail';
const noCounterTitle = 'Inbox - nobody@example.com - Gmail';

test('getCounterValue should return undefined for titles without counter numbers', () => {
  expect(getCounterValue(noCounterTitle)).toEqual(undefined);
});

test('getCounterValue should return a string for small counter numbers in the title', () => {
  expect(getCounterValue(smallCounterTitle)).toEqual('11');
});

test('getCounterValue should return a string for large counter numbers in the title', () => {
  expect(getCounterValue(largeCounterTitle)).toEqual('8,756');
});

const shortArg = '--t';
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
