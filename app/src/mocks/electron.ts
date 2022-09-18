/* eslint-disable @typescript-eslint/no-extraneous-class */
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

  constructor(options?: unknown) {
    // @ts-expect-error options is really EventEmitterOptions, but events.d.ts doesn't expose it...
    super(options);
    this.webContents = new MockWebContents();
  }

  addTabbedWindow(tab: MockBrowserWindow): void {
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

  isSimpleFullScreen(): boolean {
    throw new Error('Not implemented');
  }

  isFullScreen(): boolean {
    throw new Error('Not implemented');
  }

  isFullScreenable(): boolean {
    throw new Error('Not implemented');
  }

  loadURL(url: string, options?: unknown): Promise<void> {
    return Promise.resolve(undefined);
  }

  setFullScreen(flag: boolean): void {
    return;
  }

  setSimpleFullScreen(flag: boolean): void {
    return;
  }
}

class MockDialog {
  static showMessageBox(
    browserWindow: MockBrowserWindow,
    options: unknown,
  ): Promise<number> {
    throw new Error('Not implemented');
  }

  static showMessageBoxSync(
    browserWindow: MockBrowserWindow,
    options: unknown,
  ): number {
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
  }

  insertCSS(css: string, options?: unknown): Promise<string> {
    throw new Error('Not implemented');
  }
}

class MockWebRequest {
  emitter: InternalEmitter;

  constructor() {
    this.emitter = new InternalEmitter();
  }

  onResponseStarted(
    filter: unknown,
    listener: ((details: unknown) => void) | null,
  ): void {
    if (listener) {
      this.emitter.addListener('onResponseStarted', (details: unknown) =>
        listener(details),
      );
    }
  }

  send(event: string, ...args: unknown[]): void {
    this.emitter.emit(event, ...args);
  }
}

class InternalEmitter extends EventEmitter {}

const mockShell = {
  openExternal(url: string, options?: unknown): Promise<void> {
    return new Promise((resolve) => resolve());
  },
};

export {
  MockDialog as dialog,
  MockBrowserWindow as BrowserWindow,
  MockSession as Session,
  MockWebContents as WebContents,
  MockWebRequest as WebRequest,
  mockShell as shell,
};
