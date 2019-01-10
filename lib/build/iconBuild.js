'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _helpers = require('../helpers/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _iconShellHelpers = require('../helpers/iconShellHelpers');

var _iconShellHelpers2 = _interopRequireDefault(_iconShellHelpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isOSX = _helpers2.default.isOSX;
var convertToPng = _iconShellHelpers2.default.convertToPng,
    convertToIco = _iconShellHelpers2.default.convertToIco,
    convertToIcns = _iconShellHelpers2.default.convertToIcns;


function iconIsIco(iconPath) {
  return _path2.default.extname(iconPath) === '.ico';
}

function iconIsPng(iconPath) {
  return _path2.default.extname(iconPath) === '.png';
}

function iconIsIcns(iconPath) {
  return _path2.default.extname(iconPath) === '.icns';
}

/**
 * @callback augmentIconsCallback
 * @param error
 * @param options
 */

/**
 * Will check and convert a `.png` to `.icns` if necessary and augment
 * options.icon with the result
 *
 * @param inpOptions will need options.platform and options.icon
 * @param {augmentIconsCallback} callback
 */
function iconBuild(inpOptions, callback) {
  var options = Object.assign({}, inpOptions);
  var returnCallback = function returnCallback() {
    callback(null, options);
  };

  if (!options.icon) {
    returnCallback();
    return;
  }

  if (options.platform === 'win32') {
    if (iconIsIco(options.icon)) {
      returnCallback();
      return;
    }

    convertToIco(options.icon).then(function (outPath) {
      options.icon = outPath;
      returnCallback();
    }).catch(function (error) {
      _loglevel2.default.warn('Skipping icon conversion to .ico', error);
      returnCallback();
    });
    return;
  }

  if (options.platform === 'linux') {
    if (iconIsPng(options.icon)) {
      returnCallback();
      return;
    }

    convertToPng(options.icon).then(function (outPath) {
      options.icon = outPath;
      returnCallback();
    }).catch(function (error) {
      _loglevel2.default.warn('Skipping icon conversion to .png', error);
      returnCallback();
    });
    return;
  }

  if (iconIsIcns(options.icon)) {
    returnCallback();
    return;
  }

  if (!isOSX()) {
    _loglevel2.default.warn('Skipping icon conversion to .icns, conversion is only supported on OSX');
    returnCallback();
    return;
  }

  convertToIcns(options.icon).then(function (outPath) {
    options.icon = outPath;
    returnCallback();
  }).catch(function (error) {
    _loglevel2.default.warn('Skipping icon conversion to .icns', error);
    options.icon = undefined;
    returnCallback();
  });
}

exports.default = iconBuild;
//# sourceMappingURL=iconBuild.js.map
