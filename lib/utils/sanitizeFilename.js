'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (platform, str) {
  var result = (0, _sanitizeFilename2.default)(str);

  // remove all non ascii or use default app name
  // eslint-disable-next-line no-control-regex
  result = result.replace(/[^\x00-\x7F]/g, '') || _constants.DEFAULT_APP_NAME;

  // spaces will cause problems with Ubuntu when pinned to the dock
  if (platform === 'linux') {
    return _lodash2.default.kebabCase(result);
  }
  return result;
};

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _sanitizeFilename = require('sanitize-filename');

var _sanitizeFilename2 = _interopRequireDefault(_sanitizeFilename);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//# sourceMappingURL=sanitizeFilename.js.map
