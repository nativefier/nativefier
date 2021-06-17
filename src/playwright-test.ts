import { once } from 'events';
import * as fs from 'fs';
import * as path from 'path';

import {
  _electron as electron,
  ConsoleMessage,
  Dialog,
  ElectronApplication,
  Page,
} from 'playwright';

import { NativefierOptions } from './options/model';
import { getTempDir } from './helpers/helpers';

const INJECT_DIR = path.join(__dirname, '..', 'app', 'inject');

const log = console;

describe('Application launch', () => {
  jest.setTimeout(60000);

  let app: ElectronApplication;
  let appClosed = true;

  const appMainJSPath = path.join(__dirname, '..', 'app', 'lib', 'main.js');
  const DEFAULT_CONFIG: NativefierOptions = {
    targetUrl: 'https://npmjs.com',
  };

  const logFileDir = getTempDir('playwright');

  // const metaOrAlt = process.platform === 'darwin' ? 'Meta' : 'Alt';
  // const metaOrCtrl = process.platform === 'darwin' ? 'Meta' : 'Control';

  // Create a reporter that only displays the log from electron on failure
  const logReporter = {
    specDone: function (result: { status: string }): void {
      if (result.status === 'failed') {
        showLogs(logFileDir);
      }
    },
  };

  // @ts-expect-error should be here at runtime
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  jasmine.getEnv().addReporter(logReporter);

  const spawnApp = async (
    playwrightConfig: NativefierOptions = { ...DEFAULT_CONFIG },
    awaitFirstWindow = true,
  ): Promise<Page | undefined> => {
    app = await electron.launch({
      args: [appMainJSPath],
      env: {
        LOG_FILE_DIR: logFileDir,
        PLAYWRIGHT_TEST: '1',
        PLAYWRIGHT_CONFIG: JSON.stringify(playwrightConfig),
        USE_LOG_FILE: '1',
        VERBOSE: '1',
      },
    });
    app.on('close', () => (appClosed = true));
    appClosed = false;
    if (!awaitFirstWindow) {
      return undefined;
    }
    const window = await app.firstWindow();
    window.addListener('console', (consoleMessage: ConsoleMessage) => {
      const consoleMethods: Record<string, (...args: unknown[]) => unknown> = {
        debug: log.debug.bind(console),
        error: log.error.bind(console),
        info: log.info.bind(console),
        log: log.log.bind(console),
        trace: log.trace.bind(console),
        warn: log.warn.bind(console),
      };
      Promise.all(consoleMessage.args().map((x) => x.jsonValue()))
        .then((args) => {
          if (consoleMessage.type() in consoleMethods) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            consoleMethods[consoleMessage.type()]('window.console', args);
          } else {
            log.log('window.console', args);
          }
        })
        .catch(() => log.log('window.console', consoleMessage));
    });
    return window;
  };

  beforeEach(() => {
    nukeInjects();
    nukeLogs(logFileDir);
  });

  afterEach(async () => {
    if (app && !appClosed) {
      await app.close();
    }
  });

  test('shows an initial window', async () => {
    const mainWindow = (await spawnApp()) as Page;
    await mainWindow.waitForLoadState('domcontentloaded');
    expect(app.windows()).toHaveLength(1);
    expect(await mainWindow.title()).toBe('npm');
  });

  test('can inject some CSS', async () => {
    const fuschia = 'rgb(255, 0, 255)';
    createInject(
      'inject.css',
      `* { background-color: ${fuschia} !important; }`,
    );
    const mainWindow = (await spawnApp()) as Page;
    await mainWindow.waitForLoadState('domcontentloaded');
    const headerStyle = await mainWindow.$eval('header', (el) =>
      window.getComputedStyle(el),
    );
    expect(headerStyle.backgroundColor).toBe(fuschia);

    await mainWindow.click('#nav-products-link');
    await mainWindow.waitForLoadState('domcontentloaded');
    const headerStylePostNavigate = await mainWindow.$eval('header', (el) =>
      window.getComputedStyle(el),
    );
    expect(headerStylePostNavigate.backgroundColor).toBe(fuschia);
  });

  test('can inject some JS', async () => {
    const alertMsg = 'hello world from inject';
    createInject(
      'inject.js',
      `setTimeout(() => {alert("${alertMsg}"); }, 5000);`, // Buy ourselves 5 seconds to get the dialog handler setup
    );
    const mainWindow = (await spawnApp()) as Page;
    const [dialogPromise] = (await once(
      mainWindow,
      'dialog',
    )) as unknown as Promise<Dialog>[];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const dialog: Dialog = await dialogPromise;
    await dialog.dismiss();
    expect(dialog.message()).toBe(alertMsg);
  });

  test('can open internal links', async () => {
    const mainWindow = (await spawnApp()) as Page;
    await mainWindow.waitForLoadState('domcontentloaded');
    await mainWindow.click('#nav-products-link');
    await mainWindow.waitForLoadState('domcontentloaded');
    expect(app.windows()).toHaveLength(1);
  });

  test('tries to open external links', async () => {
    const mainWindow = (await spawnApp()) as Page;
    await mainWindow.waitForLoadState('domcontentloaded');

    // Install the mock first
    await app.evaluate(({ shell }) => {
      // @ts-expect-error injecting into shell so that this promise
      // can be accessed outside of this anonymous function's scope
      // Not my favorite thing to do, but I could not find another way
      process.openExternalPromise = new Promise((resolve) => {
        shell.openExternal = async (url: string): Promise<void> => {
          resolve(url);
          return Promise.resolve();
        };
      });
    });

    // Click, but don't await it - Playwright waits for stuff that does not happen when Electron does openExternal.
    mainWindow
      .click('#footer > div:nth-child(2) > ul > li:nth-child(2) > a')
      .catch((err: unknown) => {
        expect(err).toBeUndefined();
      });

    // Go pull out our value returned by our hacky global promise
    const openExternalUrl = await app.evaluate('process.openExternalPromise');
    expect(openExternalUrl).not.toBe('https://www.npmjs.com/');

    expect(openExternalUrl).not.toBe(DEFAULT_CONFIG.targetUrl);
  });

  // Currently disabled. Playwright doesn't seem to support app keypress events
  // only browser keypress events. Will fix
  // test('keyboard shortcuts: zoom', async () => {
  //   const mainWindow = await spawnApp();
  //   await mainWindow.waitForLoadState('domcontentloaded');

  //   const defaultZoom = await app.evaluate(
  //     ({ BrowserWindow }): number | undefined =>
  //       BrowserWindow.getFocusedWindow()?.webContents?.zoomFactor,
  //   );

  //   expect(defaultZoom).toBeDefined();

  //   if (defaultZoom === undefined) {
  //     // Won't actually be hit, but lets TypeScript know it won't be undefined at this point.
  //     return;
  //   }

  //   await mainWindow.keyboard.press(`${metaOrCtrl}+Equal`);
  //   const postZoomIn = await app.evaluate(
  //     ({ BrowserWindow }): number | undefined =>
  //       BrowserWindow.getFocusedWindow()?.webContents?.zoomFactor,
  //   );

  //   expect(postZoomIn).toBeGreaterThan(defaultZoom);

  //   await mainWindow.keyboard.press(`${metaOrCtrl}+0`);
  //   const postZoomReset = await app.evaluate(
  //     ({ BrowserWindow }): number | undefined =>
  //       BrowserWindow.getFocusedWindow()?.webContents?.zoomFactor,
  //   );

  //   expect(postZoomReset).toEqual(defaultZoom);

  //   await mainWindow.keyboard.press(`${metaOrCtrl}+Minus`);
  //   const postZoomOut = await app.evaluate(
  //     ({ BrowserWindow }): number | undefined =>
  //       BrowserWindow.getFocusedWindow()?.webContents?.zoomFactor,
  //   );

  //   expect(postZoomOut).toBeLessThan(defaultZoom);
  // });

  // Currently disabled. Playwright doesn't seem to support app keypress events
  // only browser keypress events.
  // test('keyboard shortcuts: back and forward', async () => {
  //   const mainWindow = await spawnApp();
  //   await mainWindow.waitForLoadState('domcontentloaded');

  //   await Promise.all([
  //     mainWindow.click('#nav-products-link'),
  //     mainWindow.waitForNavigation({ waitUntil: 'domcontentloaded' }),
  //   ]);

  //   // Go back
  //   // console.log(`${metaOrAlt}+ArrowLeft`);
  //   await mainWindow.keyboard
  //     .press(`${metaOrAlt}+ArrowLeft`);
  //   await mainWindow.waitForNavigation({ waitUntil: 'domcontentloaded' });

  //   const backUrl = await mainWindow.evaluate(() => window.location.href);

  //   expect(backUrl).toBe(DEFAULT_CONFIG.targetUrl);

  //   // Go forward
  //   // console.log(`${metaOrAlt}+ArrowRight`);
  //   await mainWindow.keyboard
  //     .press(`${metaOrAlt}+ArrowRight`);
  //   await mainWindow.waitForNavigation({ waitUntil: 'domcontentloaded' });

  //   const forwardUrl = await mainWindow.evaluate(() => window.location.href);

  //   expect(forwardUrl).not.toBe(DEFAULT_CONFIG.targetUrl);
  // });

  test('no errors thrown in console', async () => {
    await spawnApp({ ...DEFAULT_CONFIG }, false);
    const mainWindow = await app.firstWindow();
    mainWindow.addListener('console', (consoleMessage: ConsoleMessage) => {
      try {
        expect(consoleMessage.type()).not.toBe('error');
      } catch {
        // Do it this way so we'll see the whole message, not just
        // expect('error').not.toBe('error')
        // which isn't particularly useful
        expect({
          message: 'console.error called unexpectedly with',
          consoleMessage,
        }).toBeUndefined();
      }
    });
    // Give the app 5 seconds to spin up and ensure no errors happened
    await new Promise((resolve) => setTimeout(resolve, 5000));
  });

  test('basic auth', async () => {
    const mainWindow = (await spawnApp({
      targetUrl: 'http://httpbin.org/basic-auth/foo/bar',
      basicAuthUsername: 'foo',
      basicAuthPassword: 'bar',
    })) as Page;
    await mainWindow.waitForLoadState('networkidle');

    const documentText = await mainWindow.evaluate<string>(
      'document.documentElement.innerText',
    );

    const documentJSON = JSON.parse(documentText) as {
      authenticated: boolean;
      user: string;
    };

    expect(documentJSON).toEqual({
      authenticated: true,
      user: 'foo',
    });
  });

  test('basic auth without pre-providing', async () => {
    const mainWindow = (await spawnApp({
      targetUrl: 'http://httpbin.org/basic-auth/foo/bar',
    })) as Page;
    await mainWindow.waitForLoadState('load');

    // Give the app a few seconds to open the login window
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const appWindows = app.windows();

    expect(appWindows).toHaveLength(2);

    const loginWindow = appWindows.filter((x) => x !== mainWindow)[0];

    await loginWindow.waitForLoadState('domcontentloaded');

    const usernameField = await loginWindow.$('#username-input');

    expect(usernameField).not.toBeNull();

    const passwordField = await loginWindow.$('#password-input');

    expect(passwordField).not.toBeNull();

    const submitButton = await loginWindow.$('#submit-form-button');

    expect(submitButton).not.toBeNull();

    await usernameField?.fill('foo');
    await passwordField?.fill('bar');
    await submitButton?.click();

    await mainWindow.waitForLoadState('networkidle');

    const documentText = await mainWindow.evaluate<string>(
      'document.documentElement.innerText',
    );

    const documentJSON = JSON.parse(documentText) as {
      authenticated: boolean;
      user: string;
    };

    expect(documentJSON).toEqual({
      authenticated: true,
      user: 'foo',
    });
  });
});

function createInject(filename: string, contents: string): void {
  fs.writeFileSync(path.join(INJECT_DIR, filename), contents);
}

function nukeInjects(): void {
  if (!fs.existsSync(INJECT_DIR)) {
    return;
  }
  const injected = fs
    .readdirSync(INJECT_DIR)
    .filter((x) => x !== '_placeholder');
  injected.forEach((x) => fs.unlinkSync(path.join(INJECT_DIR, x)));
}

function nukeLogs(logFileDir: string): void {
  const logs = fs.readdirSync(logFileDir).filter((x) => x.endsWith('.log'));
  logs.forEach((x) => fs.unlinkSync(path.join(logFileDir, x)));
}

function showLogs(logFileDir: string): void {
  const logs = fs.readdirSync(logFileDir).filter((x) => x.endsWith('.log'));
  for (const logFile of logs) {
    log.log(fs.readFileSync(path.join(logFileDir, logFile)).toString());
  }
}
