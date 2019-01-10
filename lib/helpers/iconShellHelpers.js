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

var isWindows = _helpers2.default.isWindows,
    isOSX = _helpers2.default.isOSX;


_tmp2.default.setGracefulCleanup();

var SCRIPT_PATHS = {
  singleIco: _path2.default.join(__dirname, '../..', 'bin/singleIco'),
  convertToPng: _path2.default.join(__dirname, '../..', 'bin/convertToPng'),
  convertToIco: _path2.default.join(__dirname, '../..', 'bin/convertToIco'),
  convertToIcns: _path2.default.join(__dirname, '../..', 'bin/convertToIcns')
};

/**
 * Executes a shell script with the form "./pathToScript param1 param2"
 * @param {string} shellScriptPath
 * @param {string} icoSrc input .ico
 * @param {string} dest has to be a .ico path
 */
function iconShellHelper(shellScriptPath, icoSrc, dest) {
  return new Promise(function (resolve, reject) {
    if (isWindows()) {
      reject(new Error('OSX or Linux is required'));
      return;
    }

    _shelljs2.default.exec(`"${shellScriptPath}" "${icoSrc}" "${dest}"`, { silent: true }, function (exitCode, stdOut, stdError) {
      if (exitCode) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({
          stdOut,
          stdError
        });
        return;
      }

      resolve(dest);
    });
  });
}

function getTmpDirPath() {
  var tempIconDirObj = _tmp2.default.dirSync({ unsafeCleanup: true });
  return tempIconDirObj.name;
}

/**
 * Converts the ico to a temporary directory which will be cleaned up on process exit
 * @param {string} icoSrc path to a .ico file
 * @return {Promise}
 */

function singleIco(icoSrc) {
  return iconShellHelper(SCRIPT_PATHS.singleIco, icoSrc, `${getTmpDirPath()}/icon.ico`);
}

function convertToPng(icoSrc) {
  return iconShellHelper(SCRIPT_PATHS.convertToPng, icoSrc, `${getTmpDirPath()}/icon.png`);
}

function convertToIco(icoSrc) {
  return iconShellHelper(SCRIPT_PATHS.convertToIco, icoSrc, `${getTmpDirPath()}/icon.ico`);
}

function convertToIcns(icoSrc) {
  if (!isOSX()) {
    return new Promise(function (resolve, reject) {
      return reject(new Error('OSX is required to convert to a .icns icon'));
    });
  }
  return iconShellHelper(SCRIPT_PATHS.convertToIcns, icoSrc, `${getTmpDirPath()}/icon.icns`);
}

exports.default = {
  singleIco,
  convertToPng,
  convertToIco,
  convertToIcns
};
//# sourceMappingURL=iconShellHelpers.js.map
