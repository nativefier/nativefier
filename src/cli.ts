#!/usr/bin/env node
import 'source-map-support/register';

import * as log from 'loglevel';
import * as yargs from 'yargs';

import {
  checkInternet,
  getProcessEnvs,
  isArgFormatInvalid,
} from './helpers/helpers';
import { supportedArchs, supportedPlatforms } from './infer/inferOs';
import { buildNativefierApp } from './main';
import { NativefierOptions } from './options/model';
import { parseJson } from './utils/parseUtils';
import { DEFAULT_ELECTRON_VERSION } from './constants';

export function initArgs(argv: string[]): yargs.Argv<any> {
  const args = yargs(argv)
    .scriptName('nativefier')
    .usage(
      '$0 <targetUrl> [outputDirectory] [other options]\nor\n$0 --upgrade <pathToExistingApp> [other options]',
    )
    .example(
      '$0 <targetUrl> -n <name>',
      'Make an app from <targetUrl> and set the application name to <name>',
    )
    .example(
      '$0 --upgrade <pathToExistingApp>',
      'Upgrade (in place) the existing Nativefier app at <pathToExistingApp>',
    )
    .example(
      '$0 <targetUrl> -p <platform> -a <arch>',
      'Make an app from <targetUrl> for the os <platform> and cpu architecture <arch>',
    )
    .example(
      'for more examples and help...',
      'See https://github.com/nativefier/nativefier/blob/master/CATALOG.md',
    )
    .positional('targetUrl', {
      describe:
        'The URL that you wish to to turn into a native app. Required if not using --upgrade',
      type: 'string',
    })
    .positional('outputDirectory', {
      defaultDescription: 'current directory',
      describe: 'The directory to output the generated app to',
      normalize: true,
      type: 'string',
    })
    // App Creation Options
    .option('a', {
      alias: 'arch',
      choices: supportedArchs,
      defaultDescription: "current node's compiled cpu architecture",
      description: 'The cpu architecture to build for',
      group: 'App Creation Options',
      type: 'string',
    })
    .option('c', {
      alias: 'conceal',
      default: false,
      description: 'packages the app source code into an asar archive',
      group: 'App Creation Options',
      type: 'boolean',
    })
    .option('e', {
      alias: 'electron-version',
      defaultDescription: DEFAULT_ELECTRON_VERSION,
      description:
        "electron version to package, without the 'v', see https://github.com/electron/electron/releases",
      group: 'App Creation Options',
    })
    .option('global-shortcuts', {
      description:
        'JSON file defining global shortcuts. See https://github.com/nativefier/nativefier/blob/master/docs/api.md#global-shortcuts',
      group: 'App Creation Options',
      normalize: true,
      type: 'string',
    })
    .option('i', {
      alias: 'icon',
      description:
        'the icon file to use as the icon for the app (should be a .png, on macOS can also be an .icns)',
      group: 'App Creation Options',
      normalize: true,
      type: 'string',
    })
    .option('n', {
      alias: 'name',
      defaultDescription: 'The title of the page passed via targetUrl',
      describe: 'Name to use for the app',
      group: 'App Creation Options',
      type: 'string',
    })
    .option('no-overwrite', {
      default: false,
      description: 'do not overwrite output directory if it already exists',
      group: 'App Creation Options',
      type: 'boolean',
    })
    .option('overwrite', {
      // This is needed to have the `no-overwrite` flag to work correctly
      default: true,
      hidden: true,
      type: 'boolean',
    })
    .option('p', {
      alias: 'platform',
      choices: supportedPlatforms,
      defaultDescription: 'current operating system',
      description: 'The operating system platform to build for',
      group: 'App Creation Options',
      type: 'string',
    })
    .option('portable', {
      default: false,
      description:
        'Make the app store its user data in the app folder. WARNING: see https://github.com/nativefier/nativefier/blob/master/docs/api.md#portable for security risks',
      group: 'App Creation Options',
      type: 'boolean',
    })
    .option('upgrade', {
      describe:
        'Upgrade an app built by an older version of Nativefier.\nYou must pass the full path to the existing app executable (app will be overwritten with upgraded version by default)',
      group: 'App Creation Options',
      normalize: true,
      type: 'string',
    })
    .option('widevine', {
      default: false,
      description:
        "use a Widevine-enabled version of Electron for DRM playback (use at your own risk, it's unofficial, provided by CastLabs)",
      group: 'App Creation Options',
      type: 'boolean',
    })
    // App Window Options
    .option('always-on-top', {
      default: false,
      description: 'enable always on top window',
      group: 'App Window Options',
      type: 'boolean',
    })
    .option('background-color', {
      description:
        "sets the app background color, for better integration while the app is loading. Example value: '#2e2c29'",
      group: 'App Window Options',
      type: 'string',
    })
    .option('bookmarks-menu', {
      description: 'Path to JSON configuration file for the bookmarks menu',
      normalize: true,
      group: 'App Window Options',
      type: 'string',
    })
    .option('browserwindow-options', {
      coerce: parseJson,
      description:
        'a JSON string that will be sent directly into electron BrowserWindow options. See https://github.com/nativefier/nativefier/blob/master/docs/api.md#browserwindow-options',
      group: 'App Window Options',
      type: 'string',
    })
    .option('disable-context-menu', {
      default: false,
      description: 'disable the context menu (right click)',
      group: 'App Window Options',
      type: 'boolean',
    })
    .option('disable-dev-tools', {
      default: false,
      description: 'disable developer tools (Ctrl+Shift+I / F12)',
      group: 'App Window Options',
      type: 'boolean',
    })
    .option('full-screen', {
      default: false,
      description: 'always start the app full screen',
      group: 'App Window Options',
      type: 'boolean',
    })
    .option('height', {
      defaultDescription: '800',
      description: 'set window default height in pixels',
      group: 'App Window Options',
      type: 'number',
    })
    .option('hide-window-frame', {
      default: false,
      description: 'disable window frame and controls',
      group: 'App Window Options',
      type: 'boolean',
    })
    .option('m', {
      alias: 'show-menu-bar',
      default: false,
      description: 'set menu bar visible',
      group: 'App Window Options',
      type: 'boolean',
    })
    .option('max-height', {
      defaultDescription: 'unlimited',
      description: 'set window maximum height; in pixels',
      group: 'App Window Options',
      type: 'number',
    })
    .option('max-width', {
      defaultDescription: 'unlimited',
      description: 'set window maximum width in pixels',
      group: 'App Window Options',
      type: 'number',
    })
    .option('maximize', {
      default: false,
      description: 'always start the app maximized',
      group: 'App Window Options',
      type: 'boolean',
    })
    .option('min-height', {
      defaultDescription: '0',
      description: 'set window minimum height in pixels',
      group: 'App Window Options',
      type: 'number',
    })
    .option('min-width', {
      defaultDescription: '0',
      description: 'set window minimum width in pixels',
      group: 'App Window Options',
      type: 'number',
    })
    .option('process-envs', {
      coerce: getProcessEnvs,
      description:
        'a JSON string of key/value pairs to be set as environment variables before any browser windows are opened',
      group: 'App Window Options',
      type: 'string',
    })
    .option('single-instance', {
      default: false,
      description: 'allow only a single instance of the application',
      group: 'App Window Options',
      type: 'boolean',
    })
    .option('tray', {
      default: false,
      description:
        "Allow app to stay in system tray. If 'start-in-tray' is set as argument, don't show main window on first start",
      group: 'App Window Options',
      type: 'boolean',
    })
    .option('width', {
      defaultDescription: '1280',
      description: 'app window default width in pixels',
      group: 'App Window Options',
      type: 'number',
    })
    .option('x', {
      description: 'set window x location in pixels from left',
      group: 'App Window Options',
      type: 'number',
    })
    .option('y', {
      description: 'set window y location in pixels from top',
      group: 'App Window Options',
      type: 'number',
    })
    .option('zoom', {
      default: 1.0,
      description: 'default zoom factor to use when the app is opened',
      group: 'App Window Options',
      type: 'number',
    })
    // Internal Browser Options
    .option('file-download-options', {
      coerce: parseJson,
      description:
        'a JSON string of key/value pairs to be set as file download options. See https://github.com/sindresorhus/electron-dl for available options.',
      group: 'Internal Browser Options',
      type: 'string',
    })
    .option('honest', {
      default: false,
      description:
        'prevent the normal changing of the user agent string to appear as a regular Chrome browser',
      group: 'Internal Browser Options',
      type: 'boolean',
    })
    .option('inject', {
      description:
        'path to a CSS/JS file to be injected. Pass multiple times to inject multiple files.',
      group: 'Internal Browser Options',
      type: 'array',
    })
    .option('lang', {
      defaultDescription: 'os language at runtime of the app',
      description:
        'set the language or locale to render the web site as (e.g., "fr", "en-US", "es", etc.)',
      group: 'Internal Browser Options',
      type: 'string',
    })
    .option('u', {
      alias: 'user-agent',
      description: 'set the app user agent string',
      group: 'Internal Browser Options',
      type: 'string',
    })
    // URL Handling Options
    .option('block-external-urls', {
      default: false,
      description: `forbid navigation to URLs not considered "internal" (see '--internal-urls').  Instead of opening in an external browser, attempts to navigate to external URLs will be blocked`,
      group: 'URL Handling Options',
      type: 'boolean',
    })
    .option('internal-urls', {
      defaultDescription: 'URLs sharing the same base domain',
      description:
        'regex of URLs to consider "internal"; all other URLs will be opened in an external browser.',
      group: 'URL Handling Options',
      type: 'string',
    })
    .option('proxy-rules', {
      description:
        'proxy rules; see https://www.electronjs.org/docs/api/session#sessetproxyconfig',
      group: 'URL Handling Options',
      type: 'string',
    })
    // Auth Options
    .option('basic-auth-password', {
      description: 'basic http(s) auth password',
      group: 'Auth Options',
      type: 'string',
    })
    .option('basic-auth-username', {
      description: 'basic http(s) auth username',
      group: 'Auth Options',
      type: 'string',
    })
    // Graphics Options
    .option('disable-gpu', {
      default: false,
      description: 'disable hardware acceleration',
      group: 'Graphics Options',
      type: 'boolean',
    })
    .option('enable-es3-apis', {
      default: false,
      description: 'force activation of WebGL 2.0',
      group: 'Graphics Options',
      type: 'boolean',
    })
    .option('ignore-gpu-blacklist', {
      default: false,
      description: 'force WebGL apps to work on unsupported GPUs',
      group: 'Graphics Options',
      type: 'boolean',
    })
    // Caching Options
    .option('clear-cache', {
      default: false,
      description:
        'prevent the application from preserving cache between launches',
      group: 'Caching Options',
      type: 'boolean',
    })
    .option('disk-cache-size', {
      defaultDescription: 'chromium default',
      description:
        'forces the maximum disk space (in bytes) to be used by the disk cache',
      group: 'Caching Options',
      type: 'number',
    })
    // (In)Security Options
    .option('disable-old-build-warning-yesiknowitisinsecure', {
      default: false,
      description:
        'Disables warning when opening an app made with an old version of Nativefier. Nativefier uses the Chrome browser (through Electron), and it is dangerous to keep using an old version of it.)',
      group: '(In)Security Options',
      type: 'boolean',
    })
    .option('ignore-certificate', {
      default: false,
      description: 'ignore certificate-related errors',
      group: '(In)Security Options',
      type: 'boolean',
    })
    .option('insecure', {
      default: false,
      description: 'enable loading of insecure content',
      group: '(In)Security Options',
      type: 'boolean',
    })
    // Flash Options (DEPRECATED)
    .option('flash', {
      default: false,
      deprecated: true,
      description: 'enables Adobe Flash',
      group: 'Flash Options (DEPRECATED)',
      type: 'boolean',
    })
    .option('flash-path', {
      deprecated: true,
      description: 'path to Chrome flash plugin; find it in `chrome://plugins`',
      group: 'Flash Options (DEPRECATED)',
      normalize: true,
      type: 'string',
    })
    // Platform Specific Options
    .option('app-copyright', {
      description:
        '(macOS, windows only) a human-readable copyright line for the app. Maps to `LegalCopyright` metadata property on Windows, and `NSHumanReadableCopyright` on macOS',
      group: 'Platform Specific Options',
      type: 'string',
    })
    .option('app-version', {
      description:
        '(macOS, windows only) the version of the app. Maps to the `ProductVersion` metadata property on Windows, and `CFBundleShortVersionString` on macOS.',
      group: 'Platform Specific Options',
      type: 'string',
    })
    .option('bounce', {
      default: false,
      description:
        '(macOS only) make the dock icon bounce when the counter increases',
      group: 'Platform Specific Options',
      type: 'boolean',
    })
    .option('build-version', {
      description:
        '(macOS, windows only) The build version of the app. Maps to `FileVersion` metadata property on Windows, and `CFBundleVersion` on macOS',
      group: 'Platform Specific Options',
      type: 'string',
    })
    .option('counter', {
      default: false,
      description:
        '(macOS only) set a dock count badge, determined by looking for a number in the window title',
      group: 'Platform Specific Options',
      type: 'boolean',
    })
    .option('darwin-dark-mode-support', {
      default: false,
      description: '(macOS only) enable Dark Mode support on macOS 10.14+',
      group: 'Platform Specific Options',
      type: 'boolean',
    })
    .option('f', {
      alias: 'fast-quit',
      default: false,
      description: '(macOS only) quit app on window close',
      group: 'Platform Specific Options',
      type: 'boolean',
    })
    .option('title-bar-style', {
      choices: ['hidden', 'hiddenInset'],
      description:
        '(macOS only) set title bar style. Consider injecting custom CSS (via --inject) for better integration',
      group: 'Platform Specific Options',
      type: 'string',
    })
    .option('win32metadata', {
      coerce: parseJson,
      description:
        '(windows only) a JSON string of key/value pairs (ProductName, InternalName, FileDescription) to embed as executable metadata',
      group: 'Platform Specific Options',
      type: 'string',
    })
    // Debug Options
    .option('crash-reporter', {
      description: 'remote server URL to send crash reports',
      group: 'Debug Options',
      type: 'string',
    })
    .option('verbose', {
      default: false,
      description: 'enable verbose/debug/troubleshooting logs',
      group: 'Debug Options',
      type: 'boolean',
    })
    .version()
    .help()
    .group(['version', 'help'], 'Other Options')
    .wrap(yargs.terminalWidth());

  // Have to access argv to get yargs to actually process the args passed to it
  // Do this now to go ahead and get any errors out of the way
  args.argv;

  return args;
}

export function parseArgs(args: yargs.Argv<any>): any {
  const parsed = { ...args.argv };
  parsed.targetUrl = parsed._.length > 0 ? parsed._[0].toString() : '';
  parsed.out = parsed._.length > 1 ? parsed._[1] : '';

  if (parsed.upgrade && parsed.targetUrl !== '') {
    let targetAndUpgrade = false;
    if (parsed.out === '') {
      // If we're upgrading the first positional args might be the outputDirectory, so swap these if we can
      try {
        // If this succeeds, we have a problem
        new URL(parsed.targetUrl);
        targetAndUpgrade = true;
      } catch {
        // Cool, it's not a URL
        parsed.out = parsed.targetUrl;
        parsed.targetUrl = '';
      }
    } else {
      // Someone supplied a targetUrl, an outputDirectory, and --upgrade. That's not cool.
      targetAndUpgrade = true;
    }

    if (targetAndUpgrade) {
      throw new Error(
        'ERROR: Nativefier must be called with either a targetUrl or the --upgrade option, not both.\n',
      );
    }
  }

  if (parsed.targetUrl === '' && !parsed.upgrade) {
    throw new Error(
      'ERROR: Nativefier must be called with either a targetUrl or the --upgrade option.\n',
    );
  }

  parsed.noOverwrite = parsed['no-overwrite'] = !parsed.overwrite;

  return parsed;
}

if (require.main === module) {
  // Not sure if we still need this with yargs. Keeping for now.
  const sanitizedArgs = [];
  process.argv.forEach((arg) => {
    if (isArgFormatInvalid(arg)) {
      throw new Error(
        `Invalid argument passed: ${arg} .\nNativefier supports short options (like "-n") and long options (like "--name"), all lowercase. Run "nativefier --help" for help.\nAborting`,
      );
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

  let args, parsedArgs;
  try {
    args = initArgs(sanitizedArgs.slice(2));
    parsedArgs = parseArgs(args);
  } catch (err) {
    if (args) {
      log.error(err);
      args.showHelp();
    } else {
      log.error('Failed to parse command-line arguments. Aborting.', err);
    }
    process.exit(1);
  }

  const options: NativefierOptions = {
    ...parsedArgs,
  };

  checkInternet();

  buildNativefierApp(options).catch((error) => {
    log.error('Error during build. Run with --verbose for details.', error);
  });
}
