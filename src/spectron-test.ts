import { Application } from 'spectron';
import * as path from 'path';

describe('Application launch', function () {
  jest.setTimeout(30000);

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

  beforeEach(function () {
    this.app = new Application({
      path: electronPath,
      args: [appMainJSPath],
    });
    return this.app.start();
  });

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      // Right now on mac this doesn't close the app on last window close:
      // https://github.com/electron-userland/spectron/issues/229
      return this.app.stop();
    }
  });

  it('shows an initial window', function () {
    return this.app.client.getWindowCount().then(function (count) {
      expect(count).toEqual(1);
    });
  });
});
