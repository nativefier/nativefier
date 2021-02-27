#!/usr/bin/env node
import 'source-map-support/register';

import * as commander from 'commander';
import * as dns from 'dns';
import * as log from 'loglevel';

import { buildNativefierApp } from './main';
import { isArgFormatInvalid } from './helpers/helpers';
import { isWindows } from './helpers/helpers';

// package.json is `require`d to let tsc strip the `src` folder by determining
// baseUrl=src. A static import would prevent that and cause an ugly extra "src" folder
const packageJson = require('../package.json'); // eslint-disable-line @typescript-eslint/no-var-requires

function collect(val: any, memo: any[]): any[] {
  memo.push(val);
  return memo;
}

function parseBooleanOrString(val: string): boolean | string {
  switch (val) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return val;
  }
}

function parseJson(val: string): any {
  if (!val) return {};
  try {
    return JSON.parse(val);
  } catch (err) {
    const windowsShellHint = isWindows()
      ? `\n   In particular, Windows cmd doesn't have single quotes, so you have to use only double-quotes plus escaping: "{\\"someKey\\": \\"someValue\\"}"`
      : '';

    log.error(
      `Unable to parse JSON value: ${val}\n` +
        `JSON should look like {"someString": "someValue", "someBoolean": true, "someArray": [1,2,3]}.\n` +
        ` - Only double quotes are allowed, single quotes are not.\n` +
        ` - Learn how your shell behaves and escapes characters.${windowsShellHint}\n` +
        ` - If unsure, validate your JSON using an online service.`,
    );
    throw err;
  }
}

function getProcessEnvs(val: string): any {
  if (!val) {
    return {};
  }
  return parseJson(val);
}

function checkInternet(): void {
  dns.lookup('npmjs.com', (err) => {
    if (err && err.code === 'ENOTFOUND') {
      log.warn(
        '\nNo Internet Connection\nTo offline build, download electron from https://github.com/electron/electron/releases\nand place in ~/AppData/Local/electron/Cache/ on Windows,\n~/.cache/electron on Linux or ~/Library/Caches/electron/ on Mac\nUse --electron-version to specify the version you downloaded.',
      );
    }
  });
}

if (require.main === module) {
  const sanitizedArgs = [];
  process.argv.forEach((arg) => {
    if (isArgFormatInvalid(arg)) {
      log.error(
        `Invalid argument passed: ${arg} .\nNativefier supports short options (like "-n") and long options (like "--name"), all lowercase. Run "nativefier --help" for help.\nAborting`,
      );
      process.exit(1);
    }
    if (sanitizedArgs.length > 0) {
      const previousArg = sanitizedArgs[sanitizedArgs.length - 1];

      // Work around commander.js not supporting default argument for options
      if (
        previousArg === '--tray' &&
        !['true', 'false', 'start-in-tray'].includes(arg)
      ) {
        sanitizedArgs.push('true');
      }
    }
    sanitizedArgs.push(arg);
  });

  const positionalOptions = {
    targetUrl: '',
    out: '',
  };
  const args = commander
    .name('nativefier')
    .version(packageJson.version, '-v, --version')
    .arguments('<targetUrl> [dest]')
    .action((url, outputDirectory) => {
      positionalOptions.targetUrl = url;
      positionalOptions.out = outputDirectory;
    })
    .option('-n, --name <value>', 'app name')
    .option('-p, --platform <value>', "'mac', 'mas', 'linux' or 'windows'")
    .option('-a, --arch <value>', "'ia32' or 'x64' or 'arm' or 'arm64'")
    .option(
      '--app-version <value>',
      '(macOS, windows only) the version of the app. Maps to the `ProductVersion` metadata property on Windows, and `CFBundleShortVersionString` on macOS.',
    )
    .option(
      '--build-version <value>',
      '(macOS, windows only) The build version of the app. Maps to `FileVersion` metadata property on Windows, and `CFBundleVersion` on macOS',
    )
    .option(
      '--app-copyright <value>',
      '(macOS, windows only) a human-readable copyright line for the app. Maps to `LegalCopyright` metadata property on Windows, and `NSHumanReadableCopyright` on macOS',
    )
    .option(
      '--win32metadata <json-string>',
      '(windows only) a JSON string of key/value pairs (ProductName, InternalName, FileDescription) to embed as executable metadata',
      parseJson,
    )
    .option(
      '-e, --electron-version <value>',
      "electron version to package, without the 'v', see https://github.com/electron/electron/releases",
    )
    .option(
      '--widevine',
      "use a Widevine-enabled version of Electron for DRM playback (use at your own risk, it's unofficial, provided by CastLabs)",
    )
    .option(
      '--no-overwrite',
      'do not override output directory if it already exists; defaults to false',
    )
    .option(
      '-c, --conceal',
      'packages the app source code into an asar archive; defaults to false',
    )
    .option(
      '--counter',
      '(macOS only) set a dock count badge, determined by looking for a number in the window title; defaults to false',
    )
    .option(
      '--bounce',
      '(macOS only) make the dock icon bounce when the counter increases; defaults to false',
    )
    .option(
      '-i, --icon <value>',
      'the icon file to use as the icon for the app (should be a .png, on macOS can also be an .icns)',
    )
    .option(
      '--width <value>',
      'set window default width; defaults to 1280px',
      parseInt,
    )
    .option(
      '--height <value>',
      'set window default height; defaults to 800px',
      parseInt,
    )
    .option(
      '--min-width <value>',
      'set window minimum width; defaults to 0px',
      parseInt,
    )
    .option(
      '--min-height <value>',
      'set window minimum height; defaults to 0px',
      parseInt,
    )
    .option(
      '--max-width <value>',
      'set window maximum width; default is unlimited',
      parseInt,
    )
    .option(
      '--max-height <value>',
      'set window maximum height; default is unlimited',
      parseInt,
    )
    .option('--x <value>', 'set window x location', parseInt)
    .option('--y <value>', 'set window y location', parseInt)
    .option('-m, --show-menu-bar', 'set menu bar visible; defaults to false')
    .option(
      '-f, --fast-quit',
      '(macOS only) quit app on window close; defaults to false',
    )
    .option('-u, --user-agent <value>', 'set the app user agent string')
    .option(
      '--honest',
      'prevent the normal changing of the user agent string to appear as a regular Chrome browser',
    )
    .option('--ignore-certificate', 'ignore certificate-related errors')
    .option('--disable-gpu', 'disable hardware acceleration')
    .option(
      '--ignore-gpu-blacklist',
      'force WebGL apps to work on unsupported GPUs',
    )
    .option('--enable-es3-apis', 'force activation of WebGL 2.0')
    .option(
      '--insecure',
      'enable loading of insecure content; defaults to false',
    )
    .option('--flash', 'enables Adobe Flash; defaults to false')
    .option(
      '--flash-path <value>',
      'path to Chrome flash plugin; find it in `chrome://plugins`',
    )
    .option(
      '--disk-cache-size <value>',
      'forces the maximum disk space (in bytes) to be used by the disk cache',
    )
    .option(
      '--inject <value>',
      'path to a CSS/JS file to be injected. Pass multiple times to inject multiple files.',
      collect,
      [],
    )
    .option('--full-screen', 'always start the app full screen')
    .option('--maximize', 'always start the app maximized')
    .option('--hide-window-frame', 'disable window frame and controls')
    .option('--verbose', 'enable verbose/debug/troubleshooting logs')
    .option('--disable-context-menu', 'disable the context menu (right click)')
    .option(
      '--disable-dev-tools',
      'disable developer tools (Ctrl+Shift+I / F12)',
    )
    .option(
      '--zoom <value>',
      'default zoom factor to use when the app is opened; defaults to 1.0',
      parseFloat,
    )
    .option(
      '--internal-urls <value>',
      'regex of URLs to consider "internal"; all other URLs will be opened in an external browser. Default: URLs on same second-level domain as app',
    )
    .option(
      '--block-external-urls',
      `forbid navigation to URLs not considered "internal" (see '--internal-urls').  Instead of opening in an external browser, attempts to navigate to external URLs will be blocked. Default: false`,
    )
    .option(
      '--proxy-rules <value>',
      'proxy rules; see https://www.electronjs.org/docs/api/session#sessetproxyconfig',
    )
    .option(
      '--crash-reporter <value>',
      'remote server URL to send crash reports',
    )
    .option(
      '--single-instance',
      'allow only a single instance of the application',
    )
    .option(
      '--clear-cache',
      'prevent the application from preserving cache between launches',
    )
    .option(
      '--processEnvs <json-string>',
      'a JSON string of key/value pairs to be set as environment variables before any browser windows are opened',
      getProcessEnvs,
    )
    .option(
      '--file-download-options <json-string>',
      'a JSON string of key/value pairs to be set as file download options. See https://github.com/sindresorhus/electron-dl for available options.',
      parseJson,
    )
    .option(
      '--tray [start-in-tray]',
      "Allow app to stay in system tray. If 'start-in-tray' is set as argument, don't show main window on first start",
      parseBooleanOrString,
    )
    .option('--basic-auth-username <value>', 'basic http(s) auth username')
    .option('--basic-auth-password <value>', 'basic http(s) auth password')
    .option('--always-on-top', 'enable always on top window')
    .option(
      '--title-bar-style <value>',
      "(macOS only) set title bar style ('hidden', 'hiddenInset'). Consider injecting custom CSS (via --inject) for better integration",
    )
    .option(
      '--global-shortcuts <value>',
      'JSON file defining global shortcuts. See https://github.com/nativefier/nativefier/blob/master/docs/api.md#global-shortcuts',
    )
    .option(
      '--browserwindow-options <json-string>',
      'a JSON string that will be sent directly into electron BrowserWindow options. See https://github.com/nativefier/nativefier/blob/master/docs/api.md#browserwindow-options',
      parseJson,
    )
    .option(
      '--background-color <value>',
      "sets the app background color, for better integration while the app is loading. Example value: '#2e2c29'",
    )
    .option(
      '--disable-old-build-warning-yesiknowitisinsecure',
      'Disables warning when opening an app made with an old version of Nativefier. Nativefier uses the Chrome browser (through Electron), and it is dangerous to keep using an old version of it.)',
    )
    .option(
      '--darwin-dark-mode-support',
      '(macOS only) enable Dark Mode support on macOS 10.14+',
    );

  try {
    args.parse(sanitizedArgs);
  } catch (err) {
    log.error('Failed to parse command-line arguments. Aborting.');
    process.exit(1);
  }

  if (!process.argv.slice(2).length) {
    commander.help();
  }
  checkInternet();
  const options = { ...positionalOptions, ...commander.opts() };
  buildNativefierApp(options).catch((error) => {
    log.error('Error during build. Run with --verbose for details.', error);
  });
}
