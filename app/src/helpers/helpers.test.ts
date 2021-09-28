import {
  linkIsInternal,
  getCounterValue,
  removeUserAgentSpecifics,
} from './helpers';

const internalUrl = 'https://medium.com/';
const internalUrlWww = 'https://www.medium.com/';
const sameBaseDomainUrl = 'https://app.medium.com/';
const internalUrlCoUk = 'https://medium.co.uk/';
const differentBaseDomainUrlCoUk = 'https://other.domain.co.uk/';
const sameBaseDomainUrlCoUk = 'https://app.medium.co.uk/';
const sameBaseDomainUrlTidalListen = 'https://listen.tidal.com/';
const sameBaseDomainUrlTidalLogin = 'https://login.tidal.com/';
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

test('a "www." of a domain should be considered internal', () => {
  expect(linkIsInternal(internalUrl, internalUrlWww, undefined)).toEqual(true);
});

test('urls on the same "base domain" should be considered internal', () => {
  expect(linkIsInternal(internalUrl, sameBaseDomainUrl, undefined)).toEqual(
    true,
  );
});

test('urls on the same "base domain" should be considered internal, even with a www', () => {
  expect(linkIsInternal(internalUrlWww, sameBaseDomainUrl, undefined)).toEqual(
    true,
  );
});

test('urls on the same "base domain" should be considered internal, even with different sub domains', () => {
  expect(
    linkIsInternal(
      sameBaseDomainUrlTidalListen,
      sameBaseDomainUrlTidalLogin,
      undefined,
    ),
  ).toEqual(true);
});

test('urls on the same "base domain" should be considered internal, long SLD', () => {
  expect(
    linkIsInternal(internalUrlCoUk, sameBaseDomainUrlCoUk, undefined),
  ).toEqual(true);
});

test('urls on the a different "base domain" are considered NOT internal, long SLD', () => {
  expect(
    linkIsInternal(internalUrlCoUk, differentBaseDomainUrlCoUk, undefined),
  ).toEqual(false);
});

const testLoginPages = [
  'https://amazon.co.uk/signin',
  'https://amazon.com/signin',
  'https://amazon.de/signin',
  'https://amazon.com/ap/signin',
  'https://facebook.co.uk/login',
  'https://facebook.com/login',
  'https://facebook.de/login',
  'https://github.co.uk/login',
  'https://github.com/login',
  'https://github.de/login',
  // GitHub 2FA flow with FIDO token
  'https://github.com/session',
  'https://github.com/sessions/two-factor/webauth',
  'https://accounts.google.co.uk',
  'https://accounts.google.com',
  'https://mail.google.com/accounts/SetOSID',
  'https://mail.google.co.uk/accounts/SetOSID',
  'https://accounts.google.de',
  'https://linkedin.co.uk/uas/login',
  'https://linkedin.com/uas/login',
  'https://linkedin.de/uas/login',
  'https://login.live.co.uk',
  'https://login.live.com',
  'https://login.live.de',
  'https://login.microsoftonline.com/common/oauth2/authorize',
  'https://login.microsoftonline.co.uk/common/oauth2/authorize',
  'https://login.microsoftonline.de/common/oauth2/authorize',
  'https://okta.co.uk',
  'https://okta.com',
  'https://subdomain.okta.com',
  'https://okta.de',
  'https://twitter.co.uk/oauth/authenticate',
  'https://twitter.com/oauth/authenticate',
  'https://twitter.de/oauth/authenticate',
  'https://appleid.apple.com/auth/authorize',
  'https://id.atlassian.com',
  'https://auth.atlassian.com',
];

test.each(testLoginPages)(
  '%s login page should be internal',
  (loginUrl: string) => {
    expect(linkIsInternal(internalUrl, loginUrl, undefined)).toEqual(true);
  },
);

// Ensure that we don't over-match service pages
const testNonLoginPages = [
  'https://www.amazon.com/Node-Cookbook-techniques-server-side-development-ebook',
  'https://github.com/nativefier/nativefier',
  'https://github.com/org/nativefier',
  'https://microsoft.com',
  'https://office.microsoftonline.com',
  'https://twitter.com/marcoroth_/status/1325938620906287104',
  'https://appleid.apple.com/account',
  'https://mail.google.com/',
  'https://atlassian.com',
];

test.each(testNonLoginPages)(
  '%s page should not be internal',
  (url: string) => {
    expect(linkIsInternal(internalUrl, url, undefined)).toEqual(false);
  },
);

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

describe('removeUserAgentSpecifics', () => {
  test('removes Electron and App specific info', () => {
    const userAgentFallback =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) app-nativefier-804458/1.0.0 Chrome/89.0.4389.128 Electron/12.0.7 Safari/537.36';
    expect(
      removeUserAgentSpecifics(
        userAgentFallback,
        'app-nativefier-804458',
        '1.0.0',
      ),
    ).not.toBe(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36',
    );
  });
});
