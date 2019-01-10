'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _electronPackager = require('electron-packager');

var _electronPackager2 = _interopRequireDefault(_electronPackager);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _ncp = require('ncp');

var _ncp2 = _interopRequireDefault(_ncp);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _hasbin = require('hasbin');

var _hasbin2 = _interopRequireDefault(_hasbin);

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _dishonestProgress = require('../helpers/dishonestProgress');

var _dishonestProgress2 = _interopRequireDefault(_dishonestProgress);

var _optionsMain = require('../options/optionsMain');

var _optionsMain2 = _interopRequireDefault(_optionsMain);

var _iconBuild = require('./iconBuild');

var _iconBuild2 = _interopRequireDefault(_iconBuild);

var _helpers = require('../helpers/helpers');

var _helpers2 = _interopRequireDefault(_helpers);

var _packagerConsole = require('../helpers/packagerConsole');

var _packagerConsole2 = _interopRequireDefault(_packagerConsole);

var _buildApp = require('./buildApp');

var _buildApp2 = _interopRequireDefault(_buildApp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var copy = _ncp2.default.ncp;
var isWindows = _helpers2.default.isWindows;

/**
 * Checks the app path array to determine if the packaging was completed successfully
 * @param appPathArray Result from electron-packager
 * @returns {*}
 */

function getAppPath(appPathArray) {
  if (appPathArray.length === 0) {
    // directory already exists, --overwrite is not set
    // exit here
    return null;
  }

  if (appPathArray.length > 1) {
    _loglevel2.default.warn('Warning: This should not be happening, packaged app path contains more than one element:', appPathArray);
  }

  return appPathArray[0];
}

/**
 * Removes the `icon` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoIconOption(options) {
  var packageOptions = JSON.parse(JSON.stringify(options));
  if (options.platform === 'win32' && !isWindows()) {
    if (!_hasbin2.default.sync('wine')) {
      _loglevel2.default.warn('Wine is required to set the icon for a Windows app when packaging on non-windows platforms');
      packageOptions.icon = null;
    }
  }
  return packageOptions;
}

/**
 * For windows and linux, we have to copy over the icon to the resources/app folder, which the
 * BrowserWindow is hard coded to read the icon from
 * @param {{}} options
 * @param {string} appPath
 * @param callback
 */
function maybeCopyIcons(options, appPath, callback) {
  if (!options.icon) {
    callback();
    return;
  }

  if (options.platform === 'darwin' || options.platform === 'mas') {
    callback();
    return;
  }

  // windows & linux
  // put the icon file into the app
  var destIconPath = _path2.default.join(appPath, 'resources/app');
  var destFileName = `icon${_path2.default.extname(options.icon)}`;
  copy(options.icon, _path2.default.join(destIconPath, destFileName), function (error) {
    callback(error);
  });
}

/**
 * Removes invalid parameters from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function removeInvalidOptions(options, param) {
  var packageOptions = JSON.parse(JSON.stringify(options));
  if (options.platform === 'win32' && !isWindows()) {
    if (!_hasbin2.default.sync('wine')) {
      _loglevel2.default.warn(`Wine is required to use "${param}" option for a Windows app when packaging on non-windows platforms`);
      packageOptions[param] = null;
    }
  }
  return packageOptions;
}

/**
 * Removes the `appCopyright` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoAppCopyrightOption(options) {
  return removeInvalidOptions(options, 'appCopyright');
}

/**
 * Removes the `buildVersion` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoBuildVersionOption(options) {
  return removeInvalidOptions(options, 'buildVersion');
}

/**
 * Removes the `appVersion` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoAppVersionOption(options) {
  return removeInvalidOptions(options, 'appVersion');
}

/**
 * Removes the `versionString` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoVersionStringOption(options) {
  return removeInvalidOptions(options, 'versionString');
}

/**
 * Removes the `win32metadata` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoWin32metadataOption(options) {
  return removeInvalidOptions(options, 'win32metadata');
}

/**
 * @callback buildAppCallback
 * @param error
 * @param {string} appPath
 */

/**
 *
 * @param {{}} inpOptions
 * @param {buildAppCallback} callback
 */
function buildMain(inpOptions, callback) {
  var options = Object.assign({}, inpOptions);

  // pre process app
  var tmpObj = _tmp2.default.dirSync({ mode: '0755', unsafeCleanup: true });
  var tmpPath = tmpObj.name;

  // todo check if this is still needed on later version of packager
  var packagerConsole = new _packagerConsole2.default();

  var progress = new _dishonestProgress2.default(5);

  _async2.default.waterfall([function (cb) {
    progress.tick('inferring');
    (0, _optionsMain2.default)(options).then(function (result) {
      cb(null, result);
    }).catch(function (error) {
      cb(error);
    });
  }, function (opts, cb) {
    progress.tick('copying');
    (0, _buildApp2.default)(opts.dir, tmpPath, opts, function (error) {
      if (error) {
        cb(error);
        return;
      }
      // Change the reference file for the Electron app to be the temporary path
      var newOptions = Object.assign({}, opts, {
        dir: tmpPath
      });
      cb(null, newOptions);
    });
  }, function (opts, cb) {
    progress.tick('icons');
    (0, _iconBuild2.default)(opts, function (error, optionsWithIcon) {
      cb(null, optionsWithIcon);
    });
  }, function (opts, cb) {
    progress.tick('packaging');
    // maybe skip passing icon parameter to electron packager
    var packageOptions = maybeNoIconOption(opts);
    // maybe skip passing other parameters to electron packager
    packageOptions = maybeNoAppCopyrightOption(packageOptions);
    packageOptions = maybeNoAppVersionOption(packageOptions);
    packageOptions = maybeNoBuildVersionOption(packageOptions);
    packageOptions = maybeNoVersionStringOption(packageOptions);
    packageOptions = maybeNoWin32metadataOption(packageOptions);

    packagerConsole.override();

    (0, _electronPackager2.default)(packageOptions).then(function (appPathArray) {
      packagerConsole.restore(); // restore console.error
      cb(null, opts, appPathArray); // options still contain the icon to waterfall
    }).catch(function (error) {
      packagerConsole.restore(); // restore console.error
      cb(error, opts); // options still contain the icon to waterfall
    });
  }, function (opts, appPathArray, cb) {
    progress.tick('finalizing');
    // somehow appPathArray is a 1 element array
    var appPath = getAppPath(appPathArray);
    if (!appPath) {
      cb();
      return;
    }

    maybeCopyIcons(opts, appPath, function (error) {
      cb(error, appPath);
    });
  }], function (error, appPath) {
    packagerConsole.playback();
    callback(error, appPath);
  });
}

exports.default = buildMain;
//# sourceMappingURL=buildMain.js.map
