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

export function normalizeUrl(testUrl: string): string {
  const urlWithProtocol = appendProtocol(testUrl);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlWithProtocol);
  } catch (err) {
    throw `Your url "${urlWithProtocol}" is invalid`;
  }
  return parsedUrl.toString();
}
