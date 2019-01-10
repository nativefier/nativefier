'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _hasbin = require('hasbin');

var _hasbin2 = _interopRequireDefault(_hasbin);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isOSX() {
  return _os2.default.platform() === 'darwin';
}

function isWindows() {
  return _os2.default.platform() === 'win32';
}

function downloadFile(fileUrl) {
  return _axios2.default.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(function (response) {
    if (!response.data) {
      return null;
    }
    return {
      data: response.data,
      ext: _path2.default.extname(fileUrl)
    };
  });
}

function allowedIconFormats(platform) {
  var hasIdentify = _hasbin2.default.sync('identify');
  var hasConvert = _hasbin2.default.sync('convert');
  var hasIconUtil = _hasbin2.default.sync('iconutil');

  var pngToIcns = hasConvert && hasIconUtil;
  var pngToIco = hasConvert;
  var icoToIcns = pngToIcns && hasIdentify;
  var icoToPng = hasConvert;

  // todo scripts for the following
  var icnsToPng = false;
  var icnsToIco = false;

  var formats = [];

  // todo shell scripting is not supported on windows, temporary override
  if (isWindows()) {
    switch (platform) {
      case 'darwin':
        formats.push('.icns');
        break;
      case 'linux':
        formats.push('.png');
        break;
      case 'win32':
        formats.push('.ico');
        break;
      default:
        throw new Error(`function allowedIconFormats error: Unknown platform ${platform}`);
    }
    return formats;
  }

  switch (platform) {
    case 'darwin':
      formats.push('.icns');
      if (pngToIcns) {
        formats.push('.png');
      }
      if (icoToIcns) {
        formats.push('.ico');
      }
      break;
    case 'linux':
      formats.push('.png');
      if (icoToPng) {
        formats.push('.ico');
      }
      if (icnsToPng) {
        formats.push('.icns');
      }
      break;
    case 'win32':
      formats.push('.ico');
      if (pngToIco) {
        formats.push('.png');
      }
      if (icnsToIco) {
        formats.push('.icns');
      }
      break;
    default:
      throw new Error(`function allowedIconFormats error: Unknown platform ${platform}`);
  }
  return formats;
}

exports.default = {
  isOSX,
  isWindows,
  downloadFile,
  allowedIconFormats
};
//# sourceMappingURL=helpers.js.map
