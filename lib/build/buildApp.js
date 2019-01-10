'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ncp = require('ncp');

var _ncp2 = _interopRequireDefault(_ncp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var copy = _ncp2.default.ncp;
var log = require('loglevel');
/**
 * Only picks certain app args to pass to nativefier.json
 * @param options
 */
function selectAppArgs(options) {
  return {
    name: options.name,
    targetUrl: options.targetUrl,
    counter: options.counter,
    bounce: options.bounce,
    width: options.width,
    height: options.height,
    minWidth: options.minWidth,
    minHeight: options.minHeight,
    maxWidth: options.maxWidth,
    maxHeight: options.maxHeight,
    x: options.x,
    y: options.y,
    showMenuBar: options.showMenuBar,
    fastQuit: options.fastQuit,
    userAgent: options.userAgent,
    nativefierVersion: options.nativefierVersion,
    ignoreCertificate: options.ignoreCertificate,
    disableGpu: options.disableGpu,
    ignoreGpuBlacklist: options.ignoreGpuBlacklist,
    enableEs3Apis: options.enableEs3Apis,
    insecure: options.insecure,
    flashPluginDir: options.flashPluginDir,
    diskCacheSize: options.diskCacheSize,
    fullScreen: options.fullScreen,
    hideWindowFrame: options.hideWindowFrame,
    maximize: options.maximize,
    disableContextMenu: options.disableContextMenu,
    disableDevTools: options.disableDevTools,
    zoom: options.zoom,
    internalUrls: options.internalUrls,
    crashReporter: options.crashReporter,
    singleInstance: options.singleInstance,
    appCopyright: options.appCopyright,
    appVersion: options.appVersion,
    buildVersion: options.buildVersion,
    win32metadata: options.win32metadata,
    versionString: options.versionString,
    processEnvs: options.processEnvs,
    fileDownloadOptions: options.fileDownloadOptions,
    tray: options.tray,
    basicAuthUsername: options.basicAuthUsername,
    basicAuthPassword: options.basicAuthPassword,
    alwaysOnTop: options.alwaysOnTop,
    titleBarStyle: options.titleBarStyle,
    globalShortcuts: options.globalShortcuts
  };
}

function maybeCopyScripts(srcs, dest) {
  if (!srcs) {
    return new Promise(function (resolve) {
      resolve();
    });
  }
  var promises = srcs.map(function (src) {
    return new Promise(function (resolve, reject) {
      if (!_fs2.default.existsSync(src)) {
        reject(new Error('Error copying injection files: file not found'));
        return;
      }

      var destFileName = void 0;
      if (_path2.default.extname(src) === '.js') {
        destFileName = 'inject.js';
      } else if (_path2.default.extname(src) === '.css') {
        destFileName = 'inject.css';
      } else {
        resolve();
        return;
      }

      copy(src, _path2.default.join(dest, 'inject', destFileName), function (error) {
        if (error) {
          reject(new Error(`Error Copying injection files: ${error}`));
          return;
        }
        resolve();
      });
    });
  });

  return new Promise(function (resolve, reject) {
    Promise.all(promises).then(function () {
      resolve();
    }).catch(function (error) {
      reject(error);
    });
  });
}

function normalizeAppName(appName, url) {
  // use a simple 3 byte random string to prevent collision
  var hash = _crypto2.default.createHash('md5');
  hash.update(url);
  var postFixHash = hash.digest('hex').substring(0, 6);
  var normalized = _lodash2.default.kebabCase(appName.toLowerCase());
  return `${normalized}-nativefier-${postFixHash}`;
}

function changeAppPackageJsonName(appPath, name, url) {
  var packageJsonPath = _path2.default.join(appPath, '/package.json');
  var packageJson = JSON.parse(_fs2.default.readFileSync(packageJsonPath));
  packageJson.name = normalizeAppName(name, url);
  _fs2.default.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
}

/**
 * Creates a temporary directory and copies the './app folder' inside,
 * and adds a text file with the configuration for the single page app.
 *
 * @param {string} src
 * @param {string} dest
 * @param {{}} options
 * @param callback
 */
function buildApp(src, dest, options, callback) {
  var appArgs = selectAppArgs(options);
  copy(src, dest, function (error) {
    if (error) {
      callback(`Error Copying temporary directory: ${error}`);
      return;
    }

    _fs2.default.writeFileSync(_path2.default.join(dest, '/nativefier.json'), JSON.stringify(appArgs));

    maybeCopyScripts(options.inject, dest).catch(function (err) {
      log.warn(err);
    }).then(function () {
      changeAppPackageJsonName(dest, appArgs.name, appArgs.targetUrl);
      callback();
    });
  });
}

exports.default = buildApp;
//# sourceMappingURL=buildApp.js.map
