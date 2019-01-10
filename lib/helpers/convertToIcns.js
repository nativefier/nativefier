'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _shelljs = require('shelljs');

var _shelljs2 = _interopRequireDefault(_shelljs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _helpers = require('./helpers');

var _helpers2 = _interopRequireDefault(_helpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isOSX = _helpers2.default.isOSX;

_tmp2.default.setGracefulCleanup();

var PNG_TO_ICNS_BIN_PATH = _path2.default.join(__dirname, '../..', 'bin/convertToIcns');

/**
 * @callback pngToIcnsCallback
 * @param error
 * @param {string} icnsDest If error, will return the original png src
 */

/**
 *
 * @param {string} pngSrc
 * @param {string} icnsDest
 * @param {pngToIcnsCallback} callback
 */
function convertToIcns(pngSrc, icnsDest, callback) {
  if (!isOSX()) {
    callback('OSX is required to convert .png to .icns icon', pngSrc);
    return;
  }

  _shelljs2.default.exec(`"${PNG_TO_ICNS_BIN_PATH}" "${pngSrc}" "${icnsDest}"`, { silent: true }, function (exitCode, stdOut, stdError) {
    if (stdOut.includes('icon.iconset:error') || exitCode) {
      if (exitCode) {
        callback({
          stdOut,
          stdError
        }, pngSrc);
        return;
      }

      callback(stdOut, pngSrc);
      return;
    }

    callback(null, icnsDest);
  });
}

/**
 * Converts the png to a temporary directory which will be cleaned up on process exit
 * @param {string} pngSrc
 * @param {pngToIcnsCallback} callback
 */
function convertToIcnsTmp(pngSrc, callback) {
  var tempIconDirObj = _tmp2.default.dirSync({ unsafeCleanup: true });
  var tempIconDirPath = tempIconDirObj.name;
  convertToIcns(pngSrc, `${tempIconDirPath}/icon.icns`, callback);
}

exports.default = convertToIcnsTmp;
//# sourceMappingURL=convertToIcns.js.map
