'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var userAgent = _ref.userAgent,
      electronVersion = _ref.electronVersion,
      platform = _ref.platform;

  if (userAgent) {
    return Promise.resolve(userAgent);
  }

  return (0, _infer.inferUserAgent)(electronVersion, platform);
};

var _infer = require('../../infer');
//# sourceMappingURL=userAgent.js.map
