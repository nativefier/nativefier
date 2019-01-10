'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _validator = require('validator');

var _validator2 = _interopRequireDefault(_validator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function appendProtocol(testUrl) {
  var parsed = _url2.default.parse(testUrl);
  if (!parsed.protocol) {
    return `http://${testUrl}`;
  }
  return testUrl;
}

function normalizeUrl(testUrl) {
  var urlWithProtocol = appendProtocol(testUrl);

  var validatorOptions = {
    require_protocol: true,
    require_tld: false,
    allow_trailing_dot: true // mDNS addresses, https://github.com/jiahaog/nativefier/issues/308
  };
  if (!_validator2.default.isURL(urlWithProtocol, validatorOptions)) {
    throw new Error(`Your Url: "${urlWithProtocol}" is invalid!`);
  }
  return urlWithProtocol;
}

exports.default = normalizeUrl;
//# sourceMappingURL=normalizeUrl.js.map
