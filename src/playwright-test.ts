import * as path from 'path';
import * as fs from 'fs';

import { _electron as electron, ElectronApplication } from 'playwright';

import { NativefierOptions } from './options/model';

const INJECT_DIR = path.join(__dirname, '..', 'app', 'inject');

const log = console;

describe('Application launch', function () {
  jest.setTimeout(30000);

  let app: ElectronApplication;

  const appMainJSPath = path.join(__dirname, '..', 'app', 'lib', 'main.js');
  const DEFAULT_CONFIG: NativefierOptions = {
    targetUrl: 'https://npmjs.com',
  };
  let playwrightConfig = DEFAULT_CONFIG;

  const spawnApp = async (): Promise<void> => {
    app = await electron.launch({
      args: [appMainJSPath, '--enable-logging', '--log-level=4'],
      env: {
        SPECTRON_TEST: 'true',
        SPECTRON_CONFIG: JSON.stringify(playwrightConfig),
      },
    });
    // Evaluation expression in the Electron context.
    const appPath = await app.evaluate<string>(({ electronApp }) =>
      /* This runs in the main Electron process, parameter here is always*/ /* the result of the require('electron') in the main app script.*/
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      electronApp.getAppPath(),
    );
    console.log(appPath);
  };

  beforeEach(() => {
    playwrightConfig = DEFAULT_CONFIG;
    nukeInjects();
  });

  afterEach(async () => {
    if (app) {
      try {
        await app.close();
      } catch (err: unknown) {
        log.error('afterEach ERROR', err);
      }
    }
  });

  it('shows an initial window', async () => {
    await spawnApp();

    // Get the first window that the app opens, wait if necessary.
    const window = await app.firstWindow();
    // Print the title.
    expect(await window.title()).toBe('npm');
  });

  // it('can inject some CSS', async () => {
  //   createInject('inject.css', '* { background-color: blue; }');
  //   await spawnApp();
  //   const header = (await app.client.findElement(
  //     'tag name',
  //     'header',
  //   )) as unknown as FindElementResult;
  //   if (header && 'header' in header) {
  //     const headerObj = header['header'];
  //     const headerKey = Object.keys(headerObj)[0];
  //     const backgroundColor = await app.client.getElementCSSValue(
  //       headerObj[headerKey],
  //       'background-color',
  //     );

  //     expect(backgroundColor).toBe('blue');
  //   }
  // });

  // it('can inject some JS', async () => {
  //   createInject('inject.js', 'console.log("hello world from inject");');
  //   await spawnApp();
  //   console.log({
  //     webContents: app.webContents,
  //     browserWindow: app.browserWindow,
  //   });
  //   expect(1).not.toBe(1);
  // });
});

// function createInject(filename: string, contents: string): void {
//   fs.writeFileSync(path.join(INJECT_DIR, filename), contents);
// }

function nukeInjects(): void {
  const injected = fs
    .readdirSync(INJECT_DIR)
    .filter((x) => x !== '_placeholder');
  injected.forEach((x) => fs.unlinkSync(path.join(INJECT_DIR, x)));
}
