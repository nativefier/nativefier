'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var icon = _ref.icon,
      targetUrl = _ref.targetUrl,
      platform = _ref.platform;

  // Icon is the path to the icon
  if (icon) {
    return Promise.resolve(icon);
  }

  return (0, _infer.inferIcon)(targetUrl, platform).catch(function (error) {
    _loglevel2.default.warn('Cannot automatically retrieve the app icon:', error);
    return null;
  });
};

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _infer = require('../../infer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=icon.js.map
