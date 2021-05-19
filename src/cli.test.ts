import 'source-map-support/register';

import { initArgs, parseArgs } from './cli';
import { parseJson } from './utils/parseUtils';

describe('initArgs + parseArgs', () => {
  let mockExit: jest.SpyInstance;

  beforeEach(() => {
    mockExit = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    mockExit.mockRestore();
  });

  test('--help forces exit', () => {
    // Mock console.log to not pollute the log with the yargs help text
    const mockLog = jest.spyOn(console, 'log').mockImplementation();
    initArgs(['https://www.google.com', '--help']);
    expect(mockExit).toHaveBeenCalledTimes(1);
    expect(mockLog).toBeCalled();
    mockLog.mockRestore();
  });

  test('--version forces exit', () => {
    // Mock console.log to not pollute the log with the yargs help text
    const mockLog = jest.spyOn(console, 'log').mockImplementation();
    initArgs(['https://www.google.com', '--version']);
    expect(mockExit).toHaveBeenCalledTimes(1);
    expect(mockLog).toBeCalled();
    mockLog.mockRestore();
  });

  // Positional options

  test('first positional becomes targetUrl', () => {
    const args = parseArgs(initArgs(['https://google.com']));
    expect(args.targetUrl).toBe('https://google.com');
    expect(args.upgrade).toBeUndefined();
  });

  test('second positional becomes out', () => {
    const args = parseArgs(initArgs(['https://google.com', 'tmp']));
    expect(args.out).toBe('tmp');
    expect(args.targetUrl).toBe('https://google.com');
    expect(args.upgrade).toBeUndefined();
  });

  // App Creation Options
  test('upgrade arg', () => {
    const args = parseArgs(initArgs(['--upgrade', 'pathToUpgrade']));
    expect(args.upgrade).toBe('pathToUpgrade');
    expect(args.targetUrl).toBe('');
  });

  test('upgrade arg with out dir', () => {
    const args = parseArgs(initArgs(['tmp', '--upgrade', 'pathToUpgrade']));
    expect(args.upgrade).toBe('pathToUpgrade');
    expect(args.out).toBe('tmp');
    expect(args.targetUrl).toBe('');
  });

  test('upgrade arg with targetUrl', () => {
    expect(() => {
      parseArgs(
        initArgs(['https://www.google.com', '--upgrade', 'path/to/upgrade']),
      );
    }).toThrow();
  });

  test('multi-inject', () => {
    const args = parseArgs(
      initArgs([
        'https://google.com',
        '--inject',
        'test.js',
        '--inject',
        'test2.js',
        '--inject',
        'test.css',
        '--inject',
        'test2.css',
      ]),
    );
    expect(args.inject).toEqual([
      'test.js',
      'test2.js',
      'test.css',
      'test2.css',
    ]);
  });

  test.each([
    { arg: 'app-copyright', shortArg: null, value: '(c) Nativefier' },
    { arg: 'app-version', shortArg: null, value: '2.0.0' },
    { arg: 'background-color', shortArg: null, value: '#FFAA88' },
    { arg: 'basic-auth-username', shortArg: null, value: 'user' },
    { arg: 'basic-auth-password', shortArg: null, value: 'p@ssw0rd' },
    { arg: 'bookmarks-menu', shortArg: null, value: 'bookmarks.json' },
    {
      arg: 'browserwindow-options',
      shortArg: null,
      value: '{"test": 456}',
      isJsonString: true,
    },
    { arg: 'build-version', shortArg: null, value: '3.0.0' },
    {
      arg: 'crash-reporter',
      shortArg: null,
      value: 'https://crash-reporter.com',
    },
    { arg: 'electron-version', shortArg: 'e', value: '1.0.0' },
    {
      arg: 'file-download-options',
      shortArg: null,
      value: '{"test": 789}',
      isJsonString: true,
    },
    { arg: 'flash-path', shortArg: null, value: 'pathToFlash' },
    { arg: 'global-shortcuts', shortArg: null, value: 'shortcuts.json' },
    { arg: 'icon', shortArg: 'i', value: 'icon.png' },
    { arg: 'internal-urls', shortArg: null, value: '.*' },
    { arg: 'lang', shortArg: null, value: 'fr' },
    { arg: 'name', shortArg: 'n', value: 'Google' },
    {
      arg: 'process-envs',
      shortArg: null,
      value: '{"test": 123}',
      isJsonString: true,
    },
    { arg: 'proxy-rules', shortArg: null, value: 'RULE: PROXY' },
    { arg: 'user-agent', shortArg: 'u', value: 'FIREFOX' },
    {
      arg: 'win32metadata',
      shortArg: null,
      value: '{"ProductName": "Google"}',
      isJsonString: true,
    },
  ])('test string arg %s', ({ arg, shortArg, value, isJsonString }) => {
    const args = parseArgs(initArgs(['https://google.com', `--${arg}`, value]));
    if (!isJsonString) {
      expect(args[arg]).toBe(value);
    } else {
      expect(args[arg]).toEqual(parseJson(value));
    }

    if (shortArg) {
      const argsShort = parseArgs(
        initArgs(['https://google.com', `-${shortArg as string}`, value]),
      );
      if (!isJsonString) {
        expect(argsShort[arg]).toBe(value);
      } else {
        expect(argsShort[arg]).toEqual(parseJson(value));
      }
    }
  });

  test.each([
    { arg: 'arch', shortArg: 'a', value: 'x64', badValue: '486' },
    { arg: 'platform', shortArg: 'p', value: 'mac', badValue: 'os2' },
    {
      arg: 'title-bar-style',
      shortArg: null,
      value: 'hidden',
      badValue: 'cool',
    },
  ])('limited choice arg %s', ({ arg, shortArg, value, badValue }) => {
    const args = parseArgs(initArgs(['https://google.com', `--${arg}`, value]));
    expect(args[arg]).toBe(value);

    // Mock console.error to not pollute the log with the yargs help text
    const mockError = jest.spyOn(console, 'error').mockImplementation();
    initArgs(['https://google.com', `--${arg}`, badValue]);
    expect(mockExit).toHaveBeenCalledTimes(1);
    expect(mockError).toBeCalled();
    mockExit.mockClear();
    mockError.mockClear();

    if (shortArg) {
      const argsShort = parseArgs(
        initArgs(['https://google.com', `-${shortArg}`, value]),
      );
      expect(argsShort[arg]).toBe(value);

      initArgs(['https://google.com', `-${shortArg}`, badValue]);
      expect(mockExit).toHaveBeenCalledTimes(1);
      expect(mockError).toBeCalled();
    }
    mockError.mockRestore();
  });

  test.each([
    { arg: 'always-on-top', shortArg: null },
    { arg: 'block-external-urls', shortArg: null },
    { arg: 'bounce', shortArg: null },
    { arg: 'clear-cache', shortArg: null },
    { arg: 'conceal', shortArg: 'c' },
    { arg: 'counter', shortArg: null },
    { arg: 'darwin-dark-mode-support', shortArg: null },
    { arg: 'disable-context-menu', shortArg: null },
    { arg: 'disable-dev-tools', shortArg: null },
    { arg: 'disable-gpu', shortArg: null },
    { arg: 'disable-old-build-warning-yesiknowitisinsecure', shortArg: null },
    { arg: 'enable-es3-apis', shortArg: null },
    { arg: 'fast-quit', shortArg: 'f' },
    { arg: 'flash', shortArg: null },
    { arg: 'full-screen', shortArg: null },
    { arg: 'hide-window-frame', shortArg: null },
    { arg: 'honest', shortArg: null },
    { arg: 'ignore-certificate', shortArg: null },
    { arg: 'ignore-gpu-blacklist', shortArg: null },
    { arg: 'insecure', shortArg: null },
    { arg: 'maximize', shortArg: null },
    { arg: 'portable', shortArg: null },
    { arg: 'show-menu-bar', shortArg: 'm' },
    { arg: 'single-instance', shortArg: null },
    { arg: 'tray', shortArg: null },
    { arg: 'verbose', shortArg: null },
    { arg: 'widevine', shortArg: null },
  ])('test boolean arg %s', ({ arg, shortArg }) => {
    const defaultArgs = parseArgs(initArgs(['https://google.com']));
    expect(defaultArgs[arg]).toBe(false);

    const args = parseArgs(initArgs(['https://google.com', `--${arg}`]));
    expect(args[arg]).toBe(true);
    if (shortArg) {
      const argsShort = parseArgs(
        initArgs(['https://google.com', `-${shortArg}`]),
      );
      expect(argsShort[arg]).toBe(true);
    }
  });

  test.each([{ arg: 'no-overwrite', shortArg: null }])(
    'test inversible boolean arg %s',
    ({ arg, shortArg }) => {
      const inverse = arg.startsWith('no-') ? arg.substr(3) : `no-${arg}`;

      const defaultArgs = parseArgs(initArgs(['https://google.com']));
      expect(defaultArgs[arg]).toBe(false);
      expect(defaultArgs[inverse]).toBe(true);

      const args = parseArgs(initArgs(['https://google.com', `--${arg}`]));
      expect(args[arg]).toBe(true);
      expect(args[inverse]).toBe(false);

      if (shortArg) {
        const argsShort = parseArgs(
          initArgs(['https://google.com', `-${shortArg as string}`]),
        );
        expect(argsShort[arg]).toBe(true);
        expect(argsShort[inverse]).toBe(true);
      }
    },
  );

  test.each([
    { arg: 'disk-cache-size', shortArg: null, value: 100 },
    { arg: 'height', shortArg: null, value: 200 },
    { arg: 'max-height', shortArg: null, value: 300 },
    { arg: 'max-width', shortArg: null, value: 400 },
    { arg: 'min-height', shortArg: null, value: 500 },
    { arg: 'min-width', shortArg: null, value: 600 },
    { arg: 'width', shortArg: null, value: 700 },
    { arg: 'x', shortArg: null, value: 800 },
    { arg: 'y', shortArg: null, value: 900 },
  ])('test numeric arg %s', ({ arg, shortArg, value }) => {
    const args = parseArgs(
      initArgs(['https://google.com', `--${arg}`, `${value}`]),
    );
    expect(args[arg]).toBe(value);

    const badArgs = parseArgs(
      initArgs(['https://google.com', `--${arg}`, 'abcd']),
    );
    expect(badArgs[arg]).toBeNaN();

    if (shortArg) {
      const shortArgs = parseArgs(
        initArgs(['https://google.com', `-${shortArg as string}`, `${value}`]),
      );
      expect(shortArgs[arg]).toBe(value);

      const badShortArgs = parseArgs(
        initArgs(['https://google.com', `-${shortArg as string}`, 'abcd']),
      );
      expect(badShortArgs[arg]).toBeNaN();
    }
  });
});
