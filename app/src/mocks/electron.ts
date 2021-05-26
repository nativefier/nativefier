/* eslint-disable @typescript-eslint/no-unused-vars */
import { EventEmitter } from 'events';

/*
  These mocks are PURPOSEFULLY minimal. A few reasons as to why:
  1. I'm l̶a̶z̶y̶ a busy person :)
  2. The less we have in here, the less we'll need to fix if an electron API changes
  3. Only mocking what we need as we need it helps reveal areas under test where electron
     is being accessed in previously unaccounted for ways
  4. These mocks will get fleshed out as more unit tests are added, so if you need
     something here as you are adding unit tests, then feel free to add exactly what you
     need (and no more than that please).

  As well, please resist the urge to turn this into a reimplimentation of electron.
  When adding functions/classes, keep your implementation to only the minimal amount of code
  it takes for TypeScript to recognize what you are doing. For anything more complex (including
  implementation code and return values) please do that within your tests via jest with
  mockImplementation or mockReturnValue.
*/

class MockBrowserWindow extends EventEmitter {
  webContents: MockWebContents;

  constructor(options?: any) {
    super(options);
    this.webContents = new MockWebContents();
  }

  addTabbedWindow(tab: MockBrowserWindow) {
    return;
  }

  focus(): void {
    return;
  }

  static fromWebContents(webContents: MockWebContents): MockBrowserWindow {
    return new MockBrowserWindow();
  }

  static getFocusedWindow(window: MockBrowserWindow): MockBrowserWindow {
    return window ?? new MockBrowserWindow();
  }

  loadURL(url: string, options?: any): Promise<void> {
    return Promise.resolve(undefined);
  }
}

class MockDialog {
  static showMessageBox(
    browserWindow: MockBrowserWindow,
    options: any,
  ): Promise<number> {
    return Promise.resolve(undefined);
  }

  static showMessageBoxSync(
    browserWindow: MockBrowserWindow,
    options: any,
  ): number {
    return undefined;
  }
}

class MockSession extends EventEmitter {
  webRequest: MockWebRequest;

  constructor() {
    super();
    this.webRequest = new MockWebRequest();
  }

  clearCache(): Promise<void> {
    return Promise.resolve();
  }

  clearStorageData(): Promise<void> {
    return Promise.resolve();
  }
}

class MockWebContents extends EventEmitter {
  session: MockSession;

  constructor() {
    super();
    this.session = new MockSession();
  }

  getURL(): string {
    return undefined;
  }

  insertCSS(css: string, options?: any): Promise<string> {
    return Promise.resolve(undefined);
  }
}

class MockWebRequest {
  emitter: InternalEmitter;

  constructor() {
    this.emitter = new InternalEmitter();
  }

  onHeadersReceived(
    filter: any,
    listener:
      | ((
          details: any,
          callback: (headersReceivedResponse: any) => void,
        ) => void)
      | null,
  ): void {
    this.emitter.addListener(
      'onHeadersReceived',
      (details: any, callback: (headersReceivedResponse: any) => void) =>
        listener(details, callback),
    );
  }

  send(event: string, ...args: any[]): void {
    this.emitter.emit(event, ...args);
  }
}

class InternalEmitter extends EventEmitter {}

export {
  MockDialog as dialog,
  MockBrowserWindow as BrowserWindow,
  MockSession as Session,
  MockWebContents as WebContents,
  MockWebRequest as WebRequest,
};
