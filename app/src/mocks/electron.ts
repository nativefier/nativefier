import { EventEmitter } from 'events';

class MockBrowserWindow extends EventEmitter {
  static fromWebContents(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    webContents: MockWebContents,
  ): MockBrowserWindow {
    return new MockBrowserWindow();
  }
}

class MockDialog {
  static showMessageBoxSync = (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    browserWindow: MockBrowserWindow,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options: any,
  ): number => {
    return undefined;
  };
}

class MockWebContents extends EventEmitter {}

export {
  MockDialog as dialog,
  MockBrowserWindow as BrowserWindow,
  MockWebContents as WebContents,
};
