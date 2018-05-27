import helpers from './helpers';

const { linkIsInternal } = helpers;

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
