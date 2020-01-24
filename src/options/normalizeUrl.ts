import * as url from 'url';

import isURL from 'validator/lib/isURL';

function appendProtocol(testUrl: string): string {
  const parsed = url.parse(testUrl);
  if (!parsed.protocol) {
    return `http://${testUrl}`;
  }
  return testUrl;
}

export function normalizeUrl(testUrl: string): string {
  const urlWithProtocol = appendProtocol(testUrl);

  /* eslint-disable @typescript-eslint/camelcase */
  const validatorOptions = {
    require_protocol: true,
    require_tld: false,
    allow_trailing_dot: true, // mDNS addresses, https://github.com/jiahaog/nativefier/issues/308
  };
  /* eslint-enable */
  if (!isURL(urlWithProtocol, validatorOptions)) {
    throw new Error(`Your Url: "${urlWithProtocol}" is invalid!`);
  }
  return urlWithProtocol;
}
