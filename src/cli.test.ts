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
    expect(args.targetUrl).toBeUndefined();
  });

  test('upgrade arg with out dir', () => {
    const args = parseArgs(initArgs(['tmp', '--upgrade', 'pathToUpgrade']));
    expect(args.upgrade).toBe('pathToUpgrade');
    expect(args.out).toBe('tmp');
    expect(args.targetUrl).toBeUndefined();
  });

  test('upgrade arg with targetUrl', () => {
    expect(() =>
      parseArgs(
        initArgs(['https://www.google.com', '--upgrade', 'path/to/upgrade']),
      ),
    ).toThrow();
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
    { arg: 'app-copyright', shortArg: '', value: '(c) Nativefier' },
    { arg: 'app-version', shortArg: '', value: '2.0.0' },
    { arg: 'background-color', shortArg: '', value: '#FFAA88' },
    { arg: 'basic-auth-username', shortArg: '', value: 'user' },
    { arg: 'basic-auth-password', shortArg: '', value: 'p@ssw0rd' },
    { arg: 'bookmarks-menu', shortArg: '', value: 'bookmarks.json' },
    {
      arg: 'browserwindow-options',
      shortArg: '',
      value: '{"test": 456}',
      isJsonString: true,
    },
    { arg: 'build-version', shortArg: '', value: '3.0.0' },
    {
      arg: 'crash-reporter',
      shortArg: '',
      value: 'https://crash-reporter.com',
    },
    { arg: 'electron-version', shortArg: 'e', value: '1.0.0' },
    {
      arg: 'file-download-options',
      shortArg: '',
      value: '{"test": 789}',
      isJsonString: true,
    },
    { arg: 'flash-path', shortArg: '', value: 'pathToFlash' },
    { arg: 'global-shortcuts', shortArg: '', value: 'shortcuts.json' },
    { arg: 'icon', shortArg: 'i', value: 'icon.png' },
    { arg: 'internal-urls', shortArg: '', value: '.*' },
    { arg: 'lang', shortArg: '', value: 'fr' },
    { arg: 'name', shortArg: 'n', value: 'Google' },
    {
      arg: 'process-envs',
      shortArg: '',
      value: '{"test": 123}',
      isJsonString: true,
    },
    { arg: 'proxy-rules', shortArg: '', value: 'RULE: PROXY' },
    { arg: 'tray', shortArg: '', value: 'true' },
    { arg: 'user-agent', shortArg: 'u', value: 'FIREFOX' },
    {
      arg: 'win32metadata',
      shortArg: '',
      value: '{"ProductName": "Google"}',
      isJsonString: true,
    },
  ])('test string arg %s', ({ arg, shortArg, value, isJsonString }) => {
    const args = parseArgs(
      initArgs(['https://google.com', `--${arg}`, value]),
    ) as unknown as Record<string, string>;
    if (!isJsonString) {
      expect(args[arg]).toBe(value);
    } else {
      expect(args[arg]).toEqual(parseJson(value));
    }

    if (shortArg) {
      const argsShort = parseArgs(
        initArgs(['https://google.com', `-${shortArg}`, value]),
      ) as unknown as Record<string, string>;
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
      shortArg: '',
      value: 'hidden',
      badValue: 'cool',
    },
  ])('limited choice arg %s', ({ arg, shortArg, value, badValue }) => {
    const args = parseArgs(
      initArgs(['https://google.com', `--${arg}`, value]),
    ) as unknown as Record<string, string>;
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
      ) as unknown as Record<string, string>;
      expect(argsShort[arg]).toBe(value);

      initArgs(['https://google.com', `-${shortArg}`, badValue]);
      expect(mockExit).toHaveBeenCalledTimes(1);
      expect(mockError).toBeCalled();
    }
    mockError.mockRestore();
  });

  test.each([
    { arg: 'always-on-top', shortArg: '' },
    { arg: 'block-external-urls', shortArg: '' },
    { arg: 'bounce', shortArg: '' },
    { arg: 'clear-cache', shortArg: '' },
    { arg: 'conceal', shortArg: 'c' },
    { arg: 'counter', shortArg: '' },
    { arg: 'darwin-dark-mode-support', shortArg: '' },
    { arg: 'disable-context-menu', shortArg: '' },
    { arg: 'disable-dev-tools', shortArg: '' },
    { arg: 'disable-gpu', shortArg: '' },
    { arg: 'disable-old-build-warning-yesiknowitisinsecure', shortArg: '' },
    { arg: 'enable-es3-apis', shortArg: '' },
    { arg: 'fast-quit', shortArg: 'f' },
    { arg: 'flash', shortArg: '' },
    { arg: 'full-screen', shortArg: '' },
    { arg: 'hide-window-frame', shortArg: '' },
    { arg: 'honest', shortArg: '' },
    { arg: 'ignore-certificate', shortArg: '' },
    { arg: 'ignore-gpu-blacklist', shortArg: '' },
    { arg: 'insecure', shortArg: '' },
    { arg: 'maximize', shortArg: '' },
    { arg: 'portable', shortArg: '' },
    { arg: 'show-menu-bar', shortArg: 'm' },
    { arg: 'single-instance', shortArg: '' },
    { arg: 'strict-internal-urls', shortArg: '' },
    { arg: 'verbose', shortArg: '' },
    { arg: 'widevine', shortArg: '' },
  ])('test boolean arg %s', ({ arg, shortArg }) => {
    const defaultArgs = parseArgs(
      initArgs(['https://google.com']),
    ) as unknown as Record<string, boolean>;
    expect(defaultArgs[arg]).toBe(false);

    const args = parseArgs(
      initArgs(['https://google.com', `--${arg}`]),
    ) as unknown as Record<string, boolean>;
    expect(args[arg]).toBe(true);
    if (shortArg) {
      const argsShort = parseArgs(
        initArgs(['https://google.com', `-${shortArg}`]),
      ) as unknown as Record<string, boolean>;
      expect(argsShort[arg]).toBe(true);
    }
  });

  test.each([{ arg: 'no-overwrite', shortArg: '' }])(
    'test inversible boolean arg %s',
    ({ arg, shortArg }) => {
      const inverse = arg.startsWith('no-') ? arg.substr(3) : `no-${arg}`;

      const defaultArgs = parseArgs(
        initArgs(['https://google.com']),
      ) as unknown as Record<string, boolean>;
      expect(defaultArgs[arg]).toBe(false);
      expect(defaultArgs[inverse]).toBe(true);

      const args = parseArgs(
        initArgs(['https://google.com', `--${arg}`]),
      ) as unknown as Record<string, boolean>;
      expect(args[arg]).toBe(true);
      expect(args[inverse]).toBe(false);

      if (shortArg) {
        const argsShort = parseArgs(
          initArgs(['https://google.com', `-${shortArg}`]),
        ) as unknown as Record<string, boolean>;
        expect(argsShort[arg]).toBe(true);
        expect(argsShort[inverse]).toBe(true);
      }
    },
  );

  test.each([
    { arg: 'disk-cache-size', shortArg: '', value: 100 },
    { arg: 'height', shortArg: '', value: 200 },
    { arg: 'max-height', shortArg: '', value: 300 },
    { arg: 'max-width', shortArg: '', value: 400 },
    { arg: 'min-height', shortArg: '', value: 500 },
    { arg: 'min-width', shortArg: '', value: 600 },
    { arg: 'width', shortArg: '', value: 700 },
    { arg: 'x', shortArg: '', value: 800 },
    { arg: 'y', shortArg: '', value: 900 },
  ])('test numeric arg %s', ({ arg, shortArg, value }) => {
    const args = parseArgs(
      initArgs(['https://google.com', `--${arg}`, `${value}`]),
    ) as unknown as Record<string, number>;
    expect(args[arg]).toBe(value);

    const badArgs = parseArgs(
      initArgs(['https://google.com', `--${arg}`, 'abcd']),
    ) as unknown as Record<string, number>;
    expect(badArgs[arg]).toBeNaN();

    if (shortArg) {
      const shortArgs = parseArgs(
        initArgs(['https://google.com', `-${shortArg}`, `${value}`]),
      ) as unknown as Record<string, number>;
      expect(shortArgs[arg]).toBe(value);

      const badShortArgs = parseArgs(
        initArgs(['https://google.com', `-${shortArg}`, 'abcd']),
      ) as unknown as Record<string, number>;
      expect(badShortArgs[arg]).toBeNaN();
    }
  });

  test.each([
    { arg: 'tray', value: 'true' },
    { arg: 'tray', value: 'false' },
    { arg: 'tray', value: 'start-in-tray' },
    { arg: 'tray', value: '' },
  ])('test tray valyue %s', ({ arg, value }) => {
    const args = parseArgs(
      initArgs(['https://google.com', `--${arg}`, `${value}`]),
    ) as unknown as Record<string, number>;
    if (value !== '') {
      expect(args[arg]).toBe(value);
    } else {
      expect(args[arg]).toBe('true');
    }
  });

  test('test tray value defaults to false', () => {
    const args = parseArgs(initArgs(['https://google.com']));
    expect(args.tray).toBe('false');
  });
});
