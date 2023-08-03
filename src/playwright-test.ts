import { once } from 'events';
import * as fs from 'fs';
import * as path from 'path';

import { Shell } from 'electron';
import {
  _electron,
  ConsoleMessage,
  Dialog,
  ElectronApplication,
  Page,
} from 'playwright';

import { getTempDir, isLinux } from './helpers/helpers';
import { NativefierOptions } from '../shared/src/options/model';

const INJECT_DIR = path.join(__dirname, '..', 'app', 'inject');

const log = console;

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Debugging this? Run your playwright tests in debug mode:
 * DEBUG='pw:browser*' npm run test:playwright
 */
describe('Application launch', () => {
  jest.setTimeout(60000);

  let app: ElectronApplication;
  let appClosed = true;

  const appMainJSPath = path.join(__dirname, '..', 'app', 'lib', 'main.js');
  const DEFAULT_CONFIG: NativefierOptions = {
    targetUrl: 'https://npmjs.com',
  };

  const logFileDir = getTempDir('playwright');

  const metaOrAlt = process.platform === 'darwin' ? 'Meta' : 'Alt';
  const metaOrCtrl = process.platform === 'darwin' ? 'Meta' : 'Control';

  const spawnApp = async (
    playwrightConfig: NativefierOptions = { ...DEFAULT_CONFIG },
    awaitFirstWindow = true,
    preventNavigation = false,
  ): Promise<Page | undefined> => {
    const consoleListener = (consoleMessage: ConsoleMessage): void => {
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
    };
    app = await _electron.launch({
      // Workaround for the following errors in some linux distros:
      // pw:browser [pid=24716][err] [24718:0100/000000.660708:ERROR:zygote_linux.cc(650)] write: Broken pipe (32) +16ms
      // pw:browser [pid=24719][err] [24719:0725/114519.722060:FATAL:setuid_sandbox_host.cc(157)] The SUID sandbox helper binary was found, but is not configured correctly. Rather than run without sandboxing I'm aborting now. You need to make sure that /home/parallels/Dev/nativefier/node_modules/electron/dist/chrome-sandbox is owned by root and has mode 4755. +61ms
      args: isLinux()
        ? ['--no-sandbox', '--disable-setuid-sandbox', appMainJSPath]
        : [appMainJSPath],
      env: {
        LOG_FILE_DIR: logFileDir,
        PLAYWRIGHT_TEST: '1',
        PLAYWRIGHT_CONFIG: JSON.stringify({
          ...playwrightConfig,
          // disableGpu and process.env.DISPLAY forwarding solve the following errors on Linux:
          // pw:browser [pid=286188][err] [286188:0724/102939.938248:ERROR:ozone_platform_x11.cc(248)] Missing X server or $DISPLAY +77ms
          // pw:browser [pid=286188][err] [286188:0724/102939.938299:ERROR:env.cc(225)] The platform failed to initialize.  Exiting. +2ms
          disableGpu: isLinux() ? true : undefined,
          processEnvs:
            isLinux() && process.env.DISPLAY
              ? JSON.stringify({ DISPLAY: process.env.DISPLAY })
              : undefined,
        } as NativefierOptions),
        USE_LOG_FILE: '1',
        VERBOSE: '1',
      },
      timeout: 60000,
    });
    app.on('window', (page: Page) => {
      page.on('console', consoleListener);
      if (preventNavigation) {
        // Prevent page navigation so we can have a reliable test
        page
          .route('*', (route): void => {
            log.info(`Preventing route: ${route.request().url()}`);
            route.abort().catch((error) => {
              log.error('ERROR', error);
            });
          })
          .catch((error) => {
            log.error('ERROR', error);
          });
      }
    });
    app.on('close', () => (appClosed = true));
    appClosed = false;
    if (!awaitFirstWindow) {
      return undefined;
    }
    const window = await app.firstWindow();
    // Wait for our initial page to finish loading, otherwise some tests will break
    let waited = 0;
    while (
      window.url() === 'about:blank' &&
      playwrightConfig.targetUrl !== 'about:blank' &&
      waited < 2000
    ) {
      waited += 100;
      await sleep(100);
    }
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
    if (process.env.DEBUG) {
      showLogs(logFileDir);
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

    await mainWindow.click('#nav-pricing-link');
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
    const mainWindow = (await spawnApp(
      { ...DEFAULT_CONFIG },
      true,
      true,
    )) as Page;
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
    await mainWindow.click('#nav-pricing-link');
    await mainWindow.waitForLoadState('domcontentloaded');
    expect(app.windows()).toHaveLength(1);
  });

  test('tries to open external links', async () => {
    const mainWindow = (await spawnApp()) as Page;
    await mainWindow.waitForLoadState('domcontentloaded');

    // Install the mock first
    await app.evaluate(({ shell }: { shell: Shell }) => {
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

  // Currently disabled. Playwright doesn't seem to support app keypress events for menu shortcuts.
  // Will enable when https://github.com/microsoft/playwright/issues/8004 is resolved.
  test.skip('keyboard shortcuts: zoom', async () => {
    const mainWindow = (await spawnApp()) as Page;
    await mainWindow.waitForLoadState('domcontentloaded');

    const defaultZoom: number | undefined = await app.evaluate(
      ({ BrowserWindow }) =>
        BrowserWindow.getFocusedWindow()?.webContents?.zoomFactor,
    );

    expect(defaultZoom).toBeDefined();

    await mainWindow.keyboard.press(`${metaOrCtrl}+Equal`);
    const postZoomIn = await app.evaluate(
      ({ BrowserWindow }): number | undefined =>
        BrowserWindow.getFocusedWindow()?.webContents?.zoomFactor,
    );

    expect(postZoomIn).toBeGreaterThan(defaultZoom as number);

    await mainWindow.keyboard.press(`${metaOrCtrl}+0`);
    const postZoomReset = await app.evaluate(
      ({ BrowserWindow }): number | undefined =>
        BrowserWindow.getFocusedWindow()?.webContents?.zoomFactor,
    );

    expect(postZoomReset).toEqual(defaultZoom);

    await mainWindow.keyboard.press(`${metaOrCtrl}+Minus`);
    const postZoomOut: number | undefined = await app.evaluate(
      ({ BrowserWindow }) =>
        BrowserWindow.getFocusedWindow()?.webContents?.zoomFactor,
    );

    expect(postZoomOut).toBeLessThan(defaultZoom as number);
  });

  // Currently disabled. Playwright doesn't seem to support app keypress events for menu shortcuts.
  // Will enable when https://github.com/microsoft/playwright/issues/8004 is resolved.
  test.skip('keyboard shortcuts: back and forward', async () => {
    const mainWindow = (await spawnApp()) as Page;
    await mainWindow.waitForLoadState('domcontentloaded');

    await Promise.all([
      mainWindow.click('#nav-pricing-link'),
      mainWindow.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    ]);

    // Go back
    // console.log(`${metaOrAlt}+ArrowLeft`);
    await mainWindow.keyboard.press(`${metaOrAlt}+ArrowLeft`);
    await mainWindow.waitForNavigation({ waitUntil: 'domcontentloaded' });

    const backUrl = await mainWindow.evaluate(() => window.location.href);

    expect(backUrl).toBe(DEFAULT_CONFIG.targetUrl);

    // Go forward
    // console.log(`${metaOrAlt}+ArrowRight`);
    await mainWindow.keyboard.press(`${metaOrAlt}+ArrowRight`);
    await mainWindow.waitForNavigation({ waitUntil: 'domcontentloaded' });

    const forwardUrl = await mainWindow.evaluate(() => window.location.href);

    expect(forwardUrl).not.toBe(DEFAULT_CONFIG.targetUrl);
  });

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
          consoleMessage: { ...consoleMessage },
        }).toBeUndefined();
      }
    });
    // Give the app 5 seconds to spin up and ensure no errors happened
    await new Promise((resolve) => setTimeout(resolve, 5000));
  });

  test('basic auth', async () => {
    const mainWindow = (await spawnApp({
      targetUrl: 'https://authenticationtest.com/HTTPAuth/',
      basicAuthUsername: 'user',
      basicAuthPassword: 'pass',
    })) as Page;
    await mainWindow.waitForLoadState('networkidle');

    const documentText = await mainWindow.evaluate<string>(
      'document.documentElement.innerText',
    );

    expect(documentText).toContain('Success');

    expect(documentText).not.toContain('Failure');
  });

  test('basic auth - bad login', async () => {
    const mainWindow = (await spawnApp({
      targetUrl: 'https://authenticationtest.com/HTTPAuth/',
      basicAuthUsername: 'userbad',
      basicAuthPassword: 'passbad',
    })) as Page;
    await mainWindow.waitForLoadState('networkidle');

    const documentText = await mainWindow.evaluate<string>(
      'document.documentElement.innerText',
    );

    expect(documentText).not.toContain('Success');

    expect(documentText).toContain('Failure');
  });

  test('basic auth without pre-providing', async () => {
    const mainWindow = (await spawnApp({
      targetUrl: 'https://authenticationtest.com/HTTPAuth/',
    })) as Page;
    await mainWindow.waitForLoadState('load');

    // Give the app a few seconds to open the login window
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const appWindows = app.windows();

    expect(appWindows).toHaveLength(2);

    const loginWindow = appWindows.filter((x) => x !== mainWindow)[0];

    await loginWindow.waitForLoadState('domcontentloaded');
    await loginWindow.waitForLoadState('load');

    const usernameField = await loginWindow.$('#username-input');
    expect(usernameField).not.toBeNull();
    await usernameField?.fill('user');

    const passwordField = await loginWindow.$('#password-input');
    expect(passwordField).not.toBeNull();
    await passwordField?.fill('pass');

    const submitButton = await loginWindow.$('#submit-form-button');
    expect(submitButton).not.toBeNull();

    // "Why is this here?" you may be asking yourself.
    // Because for some reason, on some linux boxes,
    // the click function will not work until this is done.
    // Why? I do not have access to the dark incantation
    // that would allow me to know such information.
    log.log({ submitButton });

    await submitButton?.click();

    await mainWindow.waitForEvent('load');

    const documentText = await mainWindow.evaluate<string>(
      'document.documentElement.innerText',
    );

    expect(documentText).toContain('Success');

    expect(documentText).not.toContain('Failure');
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
