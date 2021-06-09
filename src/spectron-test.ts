import { Application } from 'spectron';
import * as path from 'path';
import * as fs from 'fs';
import { NativefierOptions } from './options/model';

const INJECT_DIR = path.join(__dirname, '..', 'app', 'inject');

type FindElementResult = {
  [key: string]: {
    [key: string]: string;
  };
};

describe('Application launch', function () {
  jest.setTimeout(30000);

  let app: Application;
  const spawned: Application[] = [];

  // Your electron path can be any binary
  // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
  // But for the sake of the example we fetch it from our node_modules.
  const electronPath = path.join(
    __dirname,
    '..',
    'app',
    'node_modules',
    '.bin',
    'electron',
  );
  const appMainJSPath = path.join(__dirname, '..', 'app', 'lib', 'main.js');
  const DEFAULT_CONFIG: NativefierOptions = {
    targetUrl: 'https://npmjs.com',
  };
  let spectronConfig = DEFAULT_CONFIG;

  const spawnApp = async (): Promise<void> => {
    app = new Application({
      path: electronPath,
      args: [appMainJSPath, '--enable-logging', '--log-level=4'],
      env: {
        SPECTRON_TEST: 'true',
        SPECTRON_CONFIG: JSON.stringify(spectronConfig),
      },
    });
    await app.start();
    spawned.push(app);
  };

  beforeEach(() => {
    spectronConfig = DEFAULT_CONFIG;
    nukeInjects();
  });

  afterEach(async () => {
    await kill(app);
    nukeInjects();
  });

  afterAll(async () => {
    await killAll(spawned);
  });

  it('shows an initial window', async () => {
    await spawnApp();
    const count = await app.client.getWindowCount();
    expect(count).toEqual(1);
  });

  it('can inject some CSS', async () => {
    createInject('inject.css', '* { background-color: blue; }');
    await spawnApp();
    const header = (await app.client.findElement(
      'tag name',
      'header',
    )) as unknown as FindElementResult;
    if (header && 'header' in header) {
      const headerObj = header['header'];
      const headerKey = Object.keys(headerObj)[0];
      const backgroundColor = await app.client.getElementCSSValue(
        headerObj[headerKey],
        'background-color',
      );

      expect(backgroundColor).toBe('blue');
    }
  });

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

function createInject(filename: string, contents: string): void {
  fs.writeFileSync(path.join(INJECT_DIR, filename), contents);
}

async function kill(app: Application): Promise<void> {
  {
    if (app && app.isRunning()) {
      await app.stop();
    }

    if (app && app.mainProcess?.pid) {
      // eslint-disable-next-line no-console
      console.log(app.mainProcess.stdout?.read());
      // eslint-disable-next-line no-console
      console.error(app.mainProcess.stderr?.read());
      app.mainProcess.exit(0);
    }
  }
}

async function killAll(apps: Application[]): Promise<void> {
  // Sometimes Spectron isn't great about cleaning up windows
  await Promise.all(apps.map(async (app) => await kill(app)));
}

function nukeInjects(): void {
  const injected = fs
    .readdirSync(INJECT_DIR)
    .filter((x) => x !== '_placeholder');
  injected.forEach((x) => fs.unlinkSync(path.join(INJECT_DIR, x)));
}
