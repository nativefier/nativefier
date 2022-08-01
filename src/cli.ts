#!/usr/bin/env node
import 'source-map-support/register';

import electronPackager = require('electron-packager');
import * as log from 'loglevel';
import yargs from 'yargs';

import { DEFAULT_ELECTRON_VERSION } from './constants';
import {
  camelCased,
  checkInternet,
  getProcessEnvs,
  isArgFormatInvalid,
} from './helpers/helpers';
import { supportedArchs, supportedPlatforms } from './infer/inferOs';
import { buildNativefierApp } from './main';
import { RawOptions } from '../shared/src/options/model';
import { parseJson } from './utils/parseUtils';

// @types/yargs@17.x started pretending yargs.argv can be a promise:
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/8e17f9ca957a06040badb53ae7688fbb74229ccf/types/yargs/index.d.ts#L73
// Dunno in which case it happens, but it doesn't for us! So, having to await
// (and end up having to flag sync code as async) would be useless and annoying.
// So, copy-pastaing and axing the Promise half of yargs's type definition,
// to have a *non*-promise type. Maybe that's wrong. If it is, this type should
// be dropped, and extra async-ness should be added where needed.
type YargsArgvSync<T> = {
  [key in keyof yargs.Arguments<T> as
    | key
    | yargs.CamelCaseKey<key>]: yargs.Arguments<T>[key];
};

export function initArgs(argv: string[]): yargs.Argv<RawOptions> {
  const sanitizedArgs = sanitizeArgs(argv);
  const args = yargs(sanitizedArgs)
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
      'Make an app from <targetUrl> for the OS <platform> and CPU architecture <arch>',
    )
    .example(
      'for more examples and help...',
      'See https://github.com/nativefier/nativefier/blob/master/CATALOG.md',
    )
    .positional('targetUrl', {
      description:
        'the URL that you wish to to turn into a native app; required if not using --upgrade',
      type: 'string',
    })
    .positional('outputDirectory', {
      defaultDescription:
        'defaults to the current directory, or env. var. NATIVEFIER_APPS_DIR if set',
      description: 'the directory to generate the app in',
      normalize: true,
      type: 'string',
    })
    // App Creation Options
    .option('a', {
      alias: 'arch',
      choices: supportedArchs,
      defaultDescription: "current Node's arch",
      description: 'the CPU architecture to build for',
      type: 'string',
    })
    .option('c', {
      alias: 'conceal',
      default: false,
      description: 'package the app source code into an asar archive',
      type: 'boolean',
    })
    .option('e', {
      alias: 'electron-version',
      defaultDescription: DEFAULT_ELECTRON_VERSION,
      description:
        "specify the electron version to use (without the 'v'); see https://github.com/electron/electron/releases",
    })
    .option('global-shortcuts', {
      description:
        'define global keyboard shortcuts via a JSON file; See https://github.com/nativefier/nativefier/blob/master/API.md#global-shortcuts',
      normalize: true,
      type: 'string',
    })
    .option('i', {
      alias: 'icon',
      description:
        'the icon file to use as the icon for the app (.ico on Windows, .icns/.png on macOS, .png on Linux)',
      normalize: true,
      type: 'string',
    })
    .option('n', {
      alias: 'name',
      defaultDescription: 'the title of the page passed via targetUrl',
      description: 'specify the name of the app',
      type: 'string',
    })
    .option('no-overwrite', {
      default: false,
      description: 'do not overwrite output directory if it already exists',
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
      description: 'the operating system platform to build for',
      type: 'string',
    })
    .option('portable', {
      default: false,
      description:
        'make the app store its user data in the app folder; WARNING: see https://github.com/nativefier/nativefier/blob/master/API.md#portable for security risks',
      type: 'boolean',
    })
    .option('upgrade', {
      description:
        'upgrade an app built by an older version of Nativefier\nYou must pass the full path to the existing app executable (app will be overwritten with upgraded version by default)',
      normalize: true,
      type: 'string',
    })
    .option('widevine', {
      default: false,
      description:
        "use a Widevine-enabled version of Electron for DRM playback (use at your own risk, it's unofficial, provided by CastLabs)",
      type: 'boolean',
    })
    .group(
      [
        'arch',
        'conceal',
        'electron-version',
        'global-shortcuts',
        'icon',
        'name',
        'no-overwrite',
        'platform',
        'portable',
        'upgrade',
        'widevine',
      ],
      decorateYargOptionGroup('App Creation Options'),
    )
    // App Window Options
    .option('always-on-top', {
      default: false,
      description: 'enable always on top window',
      type: 'boolean',
    })
    .option('background-color', {
      description:
        "set the app background color, for better integration while the app is loading. Example value: '#2e2c29'",
      type: 'string',
    })
    .option('bookmarks-menu', {
      description:
        'create a bookmarks menu (via JSON file); See https://github.com/nativefier/nativefier/blob/master/API.md#bookmarks-menu',
      normalize: true,
      type: 'string',
    })
    .option('browserwindow-options', {
      coerce: parseJson,
      description:
        'override Electron BrowserWindow options (via JSON string); see https://github.com/nativefier/nativefier/blob/master/API.md#browserwindow-options',
    })
    .option('disable-context-menu', {
      default: false,
      description: 'disable the context menu (right click)',
      type: 'boolean',
    })
    .option('disable-dev-tools', {
      default: false,
      description: 'disable developer tools (Ctrl+Shift+I / F12)',
      type: 'boolean',
    })
    .option('full-screen', {
      default: false,
      description: 'always start the app full screen',
      type: 'boolean',
    })
    .option('height', {
      defaultDescription: '800',
      description: 'set window default height in pixels',
      type: 'number',
    })
    .option('hide-window-frame', {
      default: false,
      description: 'disable window frame and controls',
      type: 'boolean',
    })
    .option('m', {
      alias: 'show-menu-bar',
      default: false,
      description: 'set menu bar visible',
      type: 'boolean',
    })
    .option('max-height', {
      defaultDescription: 'unlimited',
      description: 'set window maximum height in pixels',
      type: 'number',
    })
    .option('max-width', {
      defaultDescription: 'unlimited',
      description: 'set window maximum width in pixels',
      type: 'number',
    })
    .option('maximize', {
      default: false,
      description: 'always start the app maximized',
      type: 'boolean',
    })
    .option('min-height', {
      defaultDescription: '0',
      description: 'set window minimum height in pixels',
      type: 'number',
    })
    .option('min-width', {
      defaultDescription: '0',
      description: 'set window minimum width in pixels',
      type: 'number',
    })
    .option('process-envs', {
      coerce: getProcessEnvs,
      description:
        'a JSON string of key/value pairs to be set as environment variables before any browser windows are opened',
    })
    .option('single-instance', {
      default: false,
      description: 'allow only a single instance of the app',
      type: 'boolean',
    })
    .option('tray', {
      default: 'false',
      description:
        "allow app to stay in system tray. If 'start-in-tray' is set as argument, don't show main window on first start",
      choices: ['true', 'false', 'start-in-tray'],
    })
    .option('width', {
      defaultDescription: '1280',
      description: 'app window default width in pixels',
      type: 'number',
    })
    .option('x', {
      description: 'set window x location in pixels from left',
      type: 'number',
    })
    .option('y', {
      description: 'set window y location in pixels from top',
      type: 'number',
    })
    .option('zoom', {
      default: 1.0,
      description: 'set the default zoom factor for the app',
      type: 'number',
    })
    .group(
      [
        'always-on-top',
        'background-color',
        'bookmarks-menu',
        'browserwindow-options',
        'disable-context-menu',
        'disable-dev-tools',
        'full-screen',
        'height',
        'hide-window-frame',
        'm',
        'max-width',
        'max-height',
        'maximize',
        'min-height',
        'min-width',
        'process-envs',
        'single-instance',
        'tray',
        'width',
        'x',
        'y',
        'zoom',
      ],
      decorateYargOptionGroup('App Window Options'),
    )
    // Internal Browser Options
    .option('file-download-options', {
      coerce: parseJson,
      description:
        'a JSON string defining file download options; see https://github.com/sindresorhus/electron-dl',
    })
    .option('inject', {
      description:
        'path to a CSS/JS file to be injected; pass multiple times to inject multiple files',
      string: true,
      type: 'array',
    })
    .option('lang', {
      defaultDescription: 'os language at runtime of the app',
      description:
        'set the language or locale to render the web site as (e.g., "fr", "en-US", "es", etc.)',
      type: 'string',
    })
    .option('u', {
      alias: 'user-agent',
      description:
        "set the app's user agent string; may also use 'edge', 'firefox', or 'safari' to have one auto-generated",
      type: 'string',
    })
    .option('user-agent-honest', {
      alias: 'honest',
      default: false,
      description:
        'prevent the normal changing of the user agent string to appear as a regular Chrome browser',
      type: 'boolean',
    })
    .group(
      [
        'file-download-options',
        'inject',
        'lang',
        'user-agent',
        'user-agent-honest',
      ],
      decorateYargOptionGroup('Internal Browser Options'),
    )
    // Internal Browser Cache Options
    .option('clear-cache', {
      default: false,
      description: 'prevent the app from preserving cache between launches',
      type: 'boolean',
    })
    .option('disk-cache-size', {
      defaultDescription: 'chromium default',
      description:
        'set the maximum disk space (in bytes) to be used by the disk cache',
      type: 'number',
    })
    .group(
      ['clear-cache', 'disk-cache-size'],
      decorateYargOptionGroup('Internal Browser Cache Options'),
    )
    // URL Handling Options
    .option('block-external-urls', {
      default: false,
      description: `forbid navigation to URLs not considered "internal" (see '--internal-urls').  Instead of opening in an external browser, attempts to navigate to external URLs will be blocked`,
      type: 'boolean',
    })
    .option('internal-urls', {
      defaultDescription: 'URLs sharing the same base domain',
      description: `regex of URLs to consider "internal"; by default matches based on domain (see '--strict-internal-urls'); all other URLs will be opened in an external browser`,
      type: 'string',
    })
    .option('strict-internal-urls', {
      default: false,
      description: 'disable domain-based matching on internal URLs',
      type: 'boolean',
    })
    .option('proxy-rules', {
      description:
        'proxy rules; see https://www.electronjs.org/docs/api/session#sessetproxyconfig',
      type: 'string',
    })
    .group(
      [
        'block-external-urls',
        'internal-urls',
        'strict-internal-urls',
        'proxy-rules',
      ],
      decorateYargOptionGroup('URL Handling Options'),
    )
    // Auth Options
    .option('basic-auth-password', {
      description: 'basic http(s) auth password',
      type: 'string',
    })
    .option('basic-auth-username', {
      description: 'basic http(s) auth username',
      type: 'string',
    })
    .group(
      ['basic-auth-password', 'basic-auth-username'],
      decorateYargOptionGroup('Auth Options'),
    )
    // Graphics Options
    .option('disable-gpu', {
      default: false,
      description: 'disable hardware acceleration',
      type: 'boolean',
    })
    .option('enable-es3-apis', {
      default: false,
      description: 'force activation of WebGL 2.0',
      type: 'boolean',
    })
    .option('ignore-gpu-blacklist', {
      default: false,
      description: 'force WebGL apps to work on unsupported GPUs',
      type: 'boolean',
    })
    .group(
      ['disable-gpu', 'enable-es3-apis', 'ignore-gpu-blacklist'],
      decorateYargOptionGroup('Graphics Options'),
    )
    // (In)Security Options
    .option('disable-old-build-warning-yesiknowitisinsecure', {
      default: false,
      description:
        'disable warning shown when opening an app made too long ago; Nativefier uses the Chrome browser (through Electron), and it is dangerous to keep using an old version of it',
      type: 'boolean',
    })
    .option('ignore-certificate', {
      default: false,
      description: 'ignore certificate-related errors',
      type: 'boolean',
    })
    .option('insecure', {
      default: false,
      description: 'enable loading of insecure content',
      type: 'boolean',
    })
    .group(
      [
        'disable-old-build-warning-yesiknowitisinsecure',
        'ignore-certificate',
        'insecure',
      ],
      decorateYargOptionGroup('(In)Security Options'),
    )
    // Flash Options (DEPRECATED)
    .option('flash', {
      default: false,
      deprecated: true,
      description: 'enable Adobe Flash',
      hidden: true,
      type: 'boolean',
    })
    .option('flash-path', {
      deprecated: true,
      description: 'path to Chrome flash plugin; find it in `chrome://plugins`',
      hidden: true,
      normalize: true,
      type: 'string',
    })
    // Platform Specific Options
    .option('app-copyright', {
      description:
        '(macOS, windows only) set a human-readable copyright line for the app; maps to `LegalCopyright` metadata property on Windows, and `NSHumanReadableCopyright` on macOS',
      type: 'string',
    })
    .option('app-version', {
      description:
        '(macOS, windows only) set the version of the app; maps to the `ProductVersion` metadata property on Windows, and `CFBundleShortVersionString` on macOS',
      type: 'string',
    })
    .option('bounce', {
      default: false,
      description:
        '(macOS only) make the dock icon bounce when the counter increases',
      type: 'boolean',
    })
    .option('build-version', {
      description:
        '(macOS, windows only) set the build version of the app; maps to `FileVersion` metadata property on Windows, and `CFBundleVersion` on macOS',
      type: 'string',
    })
    .option('counter', {
      default: false,
      description:
        '(macOS only) set a dock count badge, determined by looking for a number in the window title',
      type: 'boolean',
    })
    .option('darwin-dark-mode-support', {
      default: false,
      description: '(macOS only) enable Dark Mode support on macOS 10.14+',
      type: 'boolean',
    })
    .option('f', {
      alias: 'fast-quit',
      default: false,
      description: '(macOS only) quit app on window close',
      type: 'boolean',
    })
    .option('title-bar-style', {
      choices: ['hidden', 'hiddenInset'],
      description:
        '(macOS only) set title bar style; consider injecting custom CSS (via --inject) for better integration',
      type: 'string',
    })
    .option('win32metadata', {
      coerce: (value: string) =>
        parseJson<electronPackager.Win32MetadataOptions>(value),
      description:
        '(windows only) a JSON string of key/value pairs (ProductName, InternalName, FileDescription) to embed as executable metadata',
    })
    .group(
      [
        'app-copyright',
        'app-version',
        'bounce',
        'build-version',
        'counter',
        'darwin-dark-mode-support',
        'fast-quit',
        'title-bar-style',
        'win32metadata',
      ],
      decorateYargOptionGroup('Platform-Specific Options'),
    )
    // Debug Options
    .option('crash-reporter', {
      description: 'remote server URL to send crash reports',
      type: 'string',
    })
    .option('verbose', {
      default: false,
      description: 'enable verbose/debug/troubleshooting logs',
      type: 'boolean',
    })
    .option('quiet', {
      default: false,
      description: 'suppress all logging',
      type: 'boolean',
    })
    .group(
      ['crash-reporter', 'verbose', 'quiet'],
      decorateYargOptionGroup('Debug Options'),
    )
    .version()
    .help()
    .group(['version', 'help'], 'Other Options')
    .wrap(yargs.terminalWidth());

  // We must access argv in order to get yargs to actually process args
  // Do this now to go ahead and get any errors out of the way
  args.argv as YargsArgvSync<RawOptions>;

  return args as yargs.Argv<RawOptions>;
}

function decorateYargOptionGroup(value: string): string {
  return `====== ${value} ======`;
}

export function parseArgs(args: yargs.Argv<RawOptions>): RawOptions {
  const parsed = { ...(args.argv as YargsArgvSync<RawOptions>) };
  // In yargs, the _ property of the parsed args is an array of the positional args
  // https://github.com/yargs/yargs/blob/master/docs/examples.md#and-non-hyphenated-options-too-just-use-argv_
  // So try to extract the targetUrl and outputDirectory from these
  parsed.targetUrl = parsed._.length > 0 ? parsed._[0].toString() : undefined;
  parsed.out = parsed._.length > 1 ? (parsed._[1] as string) : undefined;

  if (parsed.upgrade && parsed.targetUrl) {
    let targetAndUpgrade = false;
    if (!parsed.out) {
      // If we're upgrading, the first positional args might be the outputDirectory, so swap these if we can
      try {
        // If this succeeds, we have a problem
        new URL(parsed.targetUrl);
        targetAndUpgrade = true;
      } catch {
        // Cool, it's not a URL
        parsed.out = parsed.targetUrl;
        parsed.targetUrl = undefined;
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

  if (!parsed.targetUrl && !parsed.upgrade) {
    throw new Error(
      'ERROR: Nativefier must be called with either a targetUrl or the --upgrade option.\n',
    );
  }

  parsed.noOverwrite = parsed['no-overwrite'] = !parsed.overwrite;

  // Since coerce in yargs seems to have broken since
  // https://github.com/yargs/yargs/pull/1978
  for (const arg of [
    'win32metadata',
    'browserwindow-options',
    'file-download-options',
  ]) {
    if (parsed[arg] && typeof parsed[arg] === 'string') {
      parsed[arg] = parseJson(parsed[arg] as string);
      // sets fileDownloadOptions and browserWindowOptions
      // as parsed object as they were still strings in `nativefier.json`
      // because only their snake-cased variants were being parsed above
      parsed[camelCased(arg)] = parsed[arg];
    }
  }
  if (parsed['process-envs'] && typeof parsed['process-envs'] === 'string') {
    parsed['process-envs'] = getProcessEnvs(parsed['process-envs']);
  }

  return parsed;
}

function sanitizeArgs(argv: string[]): string[] {
  const sanitizedArgs: string[] = [];
  argv.forEach((arg) => {
    if (isArgFormatInvalid(arg)) {
      throw new Error(
        `Invalid argument passed: ${arg} .\nNativefier supports short options (like "-n") and long options (like "--name"), all lowercase. Run "nativefier --help" for help.\nAborting`,
      );
    }
    const isLastArg = sanitizedArgs.length + 1 === argv.length;
    if (sanitizedArgs.length > 0) {
      const previousArg = sanitizedArgs[sanitizedArgs.length - 1];

      log.debug({ arg, previousArg, isLastArg });

      // Work around commander.js not supporting default argument for options
      if (
        previousArg === '--tray' &&
        !['true', 'false', 'start-in-tray'].includes(arg)
      ) {
        sanitizedArgs.push('true');
      }
    }
    sanitizedArgs.push(arg);

    if (arg === '--tray' && isLastArg) {
      // Add a true if --tray is last so it gets enabled
      sanitizedArgs.push('true');
    }
  });

  return sanitizedArgs;
}

if (require.main === module) {
  let args: yargs.Argv<RawOptions> | undefined = undefined;
  let parsedArgs: RawOptions;
  try {
    args = initArgs(process.argv.slice(2));
    parsedArgs = parseArgs(args);
  } catch (err: unknown) {
    if (args) {
      log.error(err);
      args.showHelp();
    } else {
      log.error('Failed to parse command-line arguments. Aborting.', err);
    }
    process.exit(1);
  }

  const options: RawOptions = {
    ...parsedArgs,
  };

  if (options.verbose) {
    log.setLevel('trace');
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      require('debug').enable('electron-packager');
    } catch (err: unknown) {
      log.debug(
        'Failed to enable electron-packager debug output. This should not happen,',
        'and suggests their internals changed. Please report an issue.',
      );
    }

    log.debug(
      'Running in verbose mode! This will produce a mountain of logs and',
      'is recommended only for troubleshooting or if you like Shakespeare.',
    );
  } else if (options.quiet) {
    log.setLevel('silent');
  } else {
    log.setLevel('info');
  }

  checkInternet();

  if (!options.out && process.env.NATIVEFIER_APPS_DIR) {
    options.out = process.env.NATIVEFIER_APPS_DIR;
  }

  buildNativefierApp(options).catch((error) => {
    log.error('Error during build. Run with --verbose for details.', error);
  });
}
