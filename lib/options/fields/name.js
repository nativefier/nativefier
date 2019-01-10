'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref2) {
  var platform = _ref2.platform,
      name = _ref2.name,
      targetUrl = _ref2.targetUrl;

  return tryToInferName({ name, targetUrl }).then(function (result) {
    return (0, _utils.sanitizeFilename)(platform, result);
  });
};

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _utils = require('../../utils');

var _infer = require('../../infer');

var _constants = require('../../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function tryToInferName(_ref) {
  var name = _ref.name,
      targetUrl = _ref.targetUrl;

  // .length also checks if its the commanderJS function or a string
  if (name && name.length > 0) {
    return Promise.resolve(name);
  }

  return (0, _infer.inferTitle)(targetUrl).then(function (pageTitle) {
    return pageTitle || _constants.DEFAULT_APP_NAME;
  }).catch(function (error) {
    _loglevel2.default.warn(`Unable to automatically determine app name, falling back to '${_constants.DEFAULT_APP_NAME}'. Reason: ${error}`);
    return _constants.DEFAULT_APP_NAME;
  });
}
//# sourceMappingURL=name.js.map
