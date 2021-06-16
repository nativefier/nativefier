import * as url from 'url';

import * as log from 'loglevel';

function appendProtocol(inputUrl: string): string {
  const parsed = url.parse(inputUrl);
  if (!parsed.protocol) {
    const urlWithProtocol = `https://${inputUrl}`;
    log.warn(
      `URL "${inputUrl}" lacks a protocol.`,
      `Will try to parse it as HTTPS: "${urlWithProtocol}".`,
      `Please pass "http://${inputUrl}" if this is what you meant.`,
    );
    return urlWithProtocol;
  }
  return inputUrl;
}

export function normalizeUrl(urlToNormalize: string): string {
  const urlWithProtocol = appendProtocol(urlToNormalize);

  let parsedUrl: url.URL;
  try {
    parsedUrl = new url.URL(urlWithProtocol);
  } catch (err: unknown) {
    log.error('normalizeUrl ERROR', err);
    throw new Error(`Your url "${urlWithProtocol}" is invalid`);
  }
  const normalizedUrl = parsedUrl.toString();
  log.debug(`Normalized URL ${urlToNormalize} to:`, normalizedUrl);
  return normalizedUrl;
}
