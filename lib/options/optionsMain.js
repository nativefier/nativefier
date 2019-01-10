'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (inpOptions) {
  var options = {
    dir: _constants.PLACEHOLDER_APP_DIR,
    name: inpOptions.name,
    targetUrl: (0, _normalizeUrl2.default)(inpOptions.targetUrl),
    platform: inpOptions.platform || inferPlatform(),
    arch: inpOptions.arch || inferArch(),
    electronVersion: inpOptions.electronVersion || _constants.ELECTRON_VERSION,
    nativefierVersion: _package2.default.version,
    out: inpOptions.out || process.cwd(),
    overwrite: inpOptions.overwrite,
    asar: inpOptions.conceal || false,
    icon: inpOptions.icon,
    counter: inpOptions.counter || false,
    bounce: inpOptions.bounce || false,
    width: inpOptions.width || 1280,
    height: inpOptions.height || 800,
    minWidth: inpOptions.minWidth,
    minHeight: inpOptions.minHeight,
    maxWidth: inpOptions.maxWidth,
    maxHeight: inpOptions.maxHeight,
    showMenuBar: inpOptions.showMenuBar || false,
    fastQuit: inpOptions.fastQuit || false,
    userAgent: inpOptions.userAgent,
    ignoreCertificate: inpOptions.ignoreCertificate || false,
    disableGpu: inpOptions.disableGpu || false,
    ignoreGpuBlacklist: inpOptions.ignoreGpuBlacklist || false,
    enableEs3Apis: inpOptions.enableEs3Apis || false,
    insecure: inpOptions.insecure || false,
    flashPluginDir: inpOptions.flashPath || inpOptions.flash || null,
    diskCacheSize: inpOptions.diskCacheSize || null,
    inject: inpOptions.inject || null,
    ignore: 'src',
    fullScreen: inpOptions.fullScreen || false,
    maximize: inpOptions.maximize || false,
    hideWindowFrame: inpOptions.hideWindowFrame,
    verbose: inpOptions.verbose,
    disableContextMenu: inpOptions.disableContextMenu,
    disableDevTools: inpOptions.disableDevTools,
    crashReporter: inpOptions.crashReporter,
    // workaround for electron-packager#375
    tmpdir: false,
    zoom: inpOptions.zoom || 1.0,
    internalUrls: inpOptions.internalUrls || null,
    singleInstance: inpOptions.singleInstance || false,
    appVersion: inpOptions.appVersion,
    buildVersion: inpOptions.buildVersion,
    appCopyright: inpOptions.appCopyright,
    versionString: inpOptions.versionString,
    win32metadata: inpOptions.win32metadata || {
      ProductName: inpOptions.name,
      InternalName: inpOptions.name,
      FileDescription: inpOptions.name
    },
    processEnvs: inpOptions.processEnvs,
    fileDownloadOptions: inpOptions.fileDownloadOptions,
    tray: inpOptions.tray || false,
    basicAuthUsername: inpOptions.basicAuthUsername || null,
    basicAuthPassword: inpOptions.basicAuthPassword || null,
    alwaysOnTop: inpOptions.alwaysOnTop || false,
    titleBarStyle: inpOptions.titleBarStyle || null,
    globalShortcuts: inpOptions.globalShortcuts || null
  };

  if (options.verbose) {
    _loglevel2.default.setLevel('trace');
  } else {
    _loglevel2.default.setLevel('error');
  }

  if (options.flashPluginDir) {
    options.insecure = true;
  }

  if (inpOptions.honest) {
    options.userAgent = null;
  }

  if (options.platform.toLowerCase() === 'windows') {
    options.platform = 'win32';
  }

  if (options.platform.toLowerCase() === 'osx' || options.platform.toLowerCase() === 'mac') {
    options.platform = 'darwin';
  }

  if (options.width > options.maxWidth) {
    options.width = options.maxWidth;
  }

  if (options.height > options.maxHeight) {
    options.height = options.maxHeight;
  }

  if (typeof inpOptions.x !== 'undefined') {
    options.x = inpOptions.x;
  }

  if (typeof inpOptions.y !== 'undefined') {
    options.y = inpOptions.y;
  }

  if (options.globalShortcuts) {
    var globalShortcutsFileContent = _fs2.default.readFileSync(options.globalShortcuts);
    options.globalShortcuts = JSON.parse(globalShortcutsFileContent);
  }

  return (0, _asyncConfig2.default)(options);
};

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _inferOs = require('../infer/inferOs');

var _inferOs2 = _interopRequireDefault(_inferOs);

var _normalizeUrl = require('./normalizeUrl');

var _normalizeUrl2 = _interopRequireDefault(_normalizeUrl);

var _package = require('../../package.json');

var _package2 = _interopRequireDefault(_package);

var _constants = require('../constants');

var _asyncConfig = require('./asyncConfig');

var _asyncConfig2 = _interopRequireDefault(_asyncConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var inferPlatform = _inferOs2.default.inferPlatform,
    inferArch = _inferOs2.default.inferArch;

/**
 * Extracts only desired keys from inpOptions and augments it with defaults
 * @param {Object} inpOptions
 * @returns {Promise}
 */
//# sourceMappingURL=optionsMain.js.map
