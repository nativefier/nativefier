import url from 'url';
import validator from 'validator';

function appendProtocol(testUrl) {
  const parsed = url.parse(testUrl);
  if (!parsed.protocol) {
    return `http://${testUrl}`;
  }
  return testUrl;
}

function normalizeUrl(testUrl) {
  const urlWithProtocol = appendProtocol(testUrl);

  const validatorOptions = {
    require_protocol: true,
    require_tld: false,
    allow_trailing_dot: true, // mDNS addresses, https://github.com/jiahaog/nativefier/issues/308
  };
  if (!validator.isURL(urlWithProtocol, validatorOptions)) {
    throw new Error(`Your Url: "${urlWithProtocol}" is invalid!`);
  }
  return urlWithProtocol;
}

export default normalizeUrl;
