import * as url from 'url';

import * as log from 'loglevel';
import isURL from 'validator/lib/isURL';

function appendProtocol(inputUrl: string): string {
  const parsed = url.parse(inputUrl);
  if (!parsed.protocol) {
    const urlWithProtocol = `https://${inputUrl}`;
    log.warn(
      `URL "${inputUrl}" seems valid, but lacks protocol.`,
      `Using HTTPS, resulting in "${urlWithProtocol}".`,
      `Please pass "http://${inputUrl}" if that's what you meant.`,
    );
    return urlWithProtocol;
  }
  return inputUrl;
}

export function normalizeUrl(testUrl: string): string {
  const urlWithProtocol = appendProtocol(testUrl);

  /* eslint-disable @typescript-eslint/camelcase */
  const validatorOptions = {
    require_protocol: true,
    require_tld: false,
    allow_trailing_dot: true, // allow mDNS addresses, https://github.com/jiahaog/nativefier/issues/308
  };
  /* eslint-enable */
  if (!isURL(urlWithProtocol, validatorOptions)) {
    throw new Error(`Your url "${urlWithProtocol}" is invalid`);
  }
  return urlWithProtocol;
}
