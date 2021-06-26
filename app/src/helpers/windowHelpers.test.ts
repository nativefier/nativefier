import {
  dialog,
  BrowserWindow,
  HeadersReceivedResponse,
  WebContents,
} from 'electron';
jest.mock('loglevel');
import { error } from 'loglevel';
import { WindowOptions } from '../../../shared/src/options/model';

jest.mock('./helpers');
import { getCSSToInject } from './helpers';
jest.mock('./windowEvents');
import { clearAppData, createNewTab, injectCSS } from './windowHelpers';

describe('clearAppData', () => {
  let window: BrowserWindow;
  let mockClearCache: jest.SpyInstance;
  let mockClearStorageData: jest.SpyInstance;
  const mockShowDialog: jest.SpyInstance = jest.spyOn(dialog, 'showMessageBox');

  beforeEach(() => {
    window = new BrowserWindow();
    mockClearCache = jest.spyOn(window.webContents.session, 'clearCache');
    mockClearStorageData = jest.spyOn(
      window.webContents.session,
      'clearStorageData',
    );
    mockShowDialog.mockReset().mockResolvedValue(undefined);
  });

  afterAll(() => {
    mockClearCache.mockRestore();
    mockClearStorageData.mockRestore();
    mockShowDialog.mockRestore();
  });

  test('will not clear app data if dialog canceled', async () => {
    mockShowDialog.mockResolvedValue(1);

    await clearAppData(window);

    expect(mockShowDialog).toHaveBeenCalledTimes(1);
    expect(mockClearCache).not.toHaveBeenCalled();
    expect(mockClearStorageData).not.toHaveBeenCalled();
  });

  test('will clear app data if ok is clicked', async () => {
    mockShowDialog.mockResolvedValue(0);

    await clearAppData(window);

    expect(mockShowDialog).toHaveBeenCalledTimes(1);
    expect(mockClearCache).not.toHaveBeenCalledTimes(1);
    expect(mockClearStorageData).not.toHaveBeenCalledTimes(1);
  });
});

describe('createNewTab', () => {
  const window = new BrowserWindow();
  const options: WindowOptions = {
    blockExternalUrls: false,
    insecure: false,
    name: 'Test App',
    targetUrl: 'https://github.com/nativefier/natifefier',
    zoom: 1.0,
  };
  const setupWindow = jest.fn();
  const url = 'https://github.com/nativefier/nativefier';
  const mockAddTabbedWindow: jest.SpyInstance = jest.spyOn(
    BrowserWindow.prototype,
    'addTabbedWindow',
  );
  const mockFocus: jest.SpyInstance = jest.spyOn(
    BrowserWindow.prototype,
    'focus',
  );
  const mockLoadURL: jest.SpyInstance = jest.spyOn(
    BrowserWindow.prototype,
    'loadURL',
  );

  test('creates new foreground tab', () => {
    const foreground = true;

    const tab = createNewTab(options, setupWindow, url, foreground, window);

    expect(mockAddTabbedWindow).toHaveBeenCalledWith(tab);
    expect(setupWindow).toHaveBeenCalledWith(options, tab);
    expect(mockLoadURL).toHaveBeenCalledWith(url);
    expect(mockFocus).not.toHaveBeenCalled();
  });

  test('creates new background tab', () => {
    const foreground = false;

    const tab = createNewTab(options, setupWindow, url, foreground, window);

    expect(mockAddTabbedWindow).toHaveBeenCalledWith(tab);
    expect(setupWindow).toHaveBeenCalledWith(options, tab);
    expect(mockLoadURL).toHaveBeenCalledWith(url);
    expect(mockFocus).toHaveBeenCalledTimes(1);
  });
});

describe('injectCSS', () => {
  jest.setTimeout(10000);

  const mockGetCSSToInject: jest.SpyInstance = getCSSToInject as jest.Mock;
  let mockGetURL: jest.SpyInstance;
  const mockLogError: jest.SpyInstance = error as jest.Mock;
  const mockWebContentsInsertCSS: jest.SpyInstance = jest.spyOn(
    WebContents.prototype,
    'insertCSS',
  );

  const css = 'body { color: white; }';
  let responseHeaders: Record<string, string[]>;

  beforeEach(() => {
    mockGetCSSToInject.mockReset().mockReturnValue('');
    mockGetURL = jest
      .spyOn(WebContents.prototype, 'getURL')
      .mockReturnValue('https://example.com');
    mockLogError.mockReset();
    mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
    responseHeaders = { 'x-header': ['value'], 'content-type': ['test/other'] };
  });

  afterAll(() => {
    mockGetCSSToInject.mockRestore();
    mockGetURL.mockRestore();
    mockLogError.mockRestore();
    mockWebContentsInsertCSS.mockRestore();
  });

  test('will not inject if getCSSToInject is empty', () => {
    const window = new BrowserWindow();

    injectCSS(window);

    expect(mockGetCSSToInject).toHaveBeenCalled();
    expect(mockWebContentsInsertCSS).not.toHaveBeenCalled();
  });

  test('will inject on did-navigate + onHeadersReceived', (done) => {
    mockGetCSSToInject.mockReturnValue(css);
    const window = new BrowserWindow();

    injectCSS(window);

    expect(mockGetCSSToInject).toHaveBeenCalled();

    window.webContents.emit('did-navigate');
    // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    window.webContents.session.webRequest.send(
      'onHeadersReceived',
      { responseHeaders, webContents: window.webContents },
      (result: HeadersReceivedResponse) => {
        expect(mockWebContentsInsertCSS).toHaveBeenCalledWith(css);
        expect(result.cancel).toBe(false);
        expect(result.responseHeaders).toBe(responseHeaders);
        done();
      },
    );
  });

  test('will catch errors inserting CSS', (done) => {
    mockGetCSSToInject.mockReturnValue(css);

    mockWebContentsInsertCSS.mockReturnValue(
      Promise.reject('css insertion error'),
    );

    const window = new BrowserWindow();

    injectCSS(window);

    expect(mockGetCSSToInject).toHaveBeenCalled();

    window.webContents.emit('did-navigate');
    // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    window.webContents.session.webRequest.send(
      'onHeadersReceived',
      { responseHeaders, webContents: window.webContents },
      (result: HeadersReceivedResponse) => {
        expect(mockWebContentsInsertCSS).toHaveBeenCalledWith(css);
        expect(mockLogError).toHaveBeenCalledWith(
          'injectCSSIntoResponse ERROR',
          'css insertion error',
        );
        expect(result.cancel).toBe(false);
        expect(result.responseHeaders).toBe(responseHeaders);
        done();
      },
    );
  });

  test.each<string | jest.DoneCallback>([
    'application/json',
    'font/woff2',
    'image/png',
  ])(
    'will not inject for content-type %s',
    // @ts-expect-error because TypeScript can't recognize that
    // '(contentType: string, done: jest.DoneCallback) => void'
    // and
    // '(...args: (string | DoneCallback)[]) => any'
    // are actually compatible.
    (contentType: string, done: jest.DoneCallback) => {
      mockGetCSSToInject.mockReturnValue(css);
      const window = new BrowserWindow();

      responseHeaders['content-type'] = [contentType];

      injectCSS(window);

      expect(mockGetCSSToInject).toHaveBeenCalled();

      expect(window.webContents.emit('did-navigate')).toBe(true);
      mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
      // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      window.webContents.session.webRequest.send(
        'onHeadersReceived',
        {
          responseHeaders,
          webContents: window.webContents,
          url: `test-${contentType}`,
        },
        (result: HeadersReceivedResponse) => {
          // insertCSS will still run once for the did-navigate
          expect(mockWebContentsInsertCSS).not.toHaveBeenCalled();
          expect(result.cancel).toBe(false);
          expect(result.responseHeaders).toBe(responseHeaders);
          done();
        },
      );
    },
  );

  test.each<string | jest.DoneCallback>(['text/html'])(
    'will inject for content-type %s',
    // @ts-expect-error because TypeScript can't recognize that
    // '(contentType: string, done: jest.DoneCallback) => void'
    // and
    // '(...args: (string | DoneCallback)[]) => any'
    // are actually compatible.
    (contentType: string, done: jest.DoneCallback) => {
      mockGetCSSToInject.mockReturnValue(css);
      const window = new BrowserWindow();

      responseHeaders['content-type'] = [contentType];

      injectCSS(window);

      expect(mockGetCSSToInject).toHaveBeenCalled();

      window.webContents.emit('did-navigate');
      mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
      // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      window.webContents.session.webRequest.send(
        'onHeadersReceived',
        {
          responseHeaders,
          webContents: window.webContents,
          url: `test-${contentType}`,
        },
        (result: HeadersReceivedResponse) => {
          expect(mockWebContentsInsertCSS).toHaveBeenCalledTimes(1);
          expect(result.cancel).toBe(false);
          expect(result.responseHeaders).toBe(responseHeaders);
          done();
        },
      );
    },
  );

  test.each<string | jest.DoneCallback>([
    'image',
    'script',
    'stylesheet',
    'xhr',
  ])(
    'will not inject for resource type %s',
    // @ts-expect-error because TypeScript can't recognize that
    // '(contentType: string, done: jest.DoneCallback) => void'
    // and
    // '(...args: (string | DoneCallback)[]) => any'
    // are actually compatible.
    (resourceType: string, done: jest.DoneCallback) => {
      mockGetCSSToInject.mockReturnValue(css);
      const window = new BrowserWindow();

      injectCSS(window);

      expect(mockGetCSSToInject).toHaveBeenCalled();

      window.webContents.emit('did-navigate');
      mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
      // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      window.webContents.session.webRequest.send(
        'onHeadersReceived',
        {
          responseHeaders,
          webContents: window.webContents,
          resourceType,
          url: `test-${resourceType}`,
        },
        (result: HeadersReceivedResponse) => {
          // insertCSS will still run once for the did-navigate
          expect(mockWebContentsInsertCSS).not.toHaveBeenCalled();
          expect(result.cancel).toBe(false);
          expect(result.responseHeaders).toBe(responseHeaders);
          done();
        },
      );
    },
  );

  test.each<string | jest.DoneCallback>(['html', 'other'])(
    'will inject for resource type %s',
    // @ts-expect-error because TypeScript can't recognize that
    // '(contentType: string, done: jest.DoneCallback) => void'
    // and
    // '(...args: (string | DoneCallback)[]) => any'
    // are actually compatible.
    (resourceType: string, done: jest.DoneCallback) => {
      mockGetCSSToInject.mockReturnValue(css);
      const window = new BrowserWindow();

      injectCSS(window);

      expect(mockGetCSSToInject).toHaveBeenCalled();

      window.webContents.emit('did-navigate');
      mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
      // @ts-expect-error this function doesn't exist in the actual electron version, but will in our mock
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      window.webContents.session.webRequest.send(
        'onHeadersReceived',
        {
          responseHeaders,
          webContents: window.webContents,
          resourceType,
          url: `test-${resourceType}`,
        },
        (result: HeadersReceivedResponse) => {
          expect(mockWebContentsInsertCSS).toHaveBeenCalledTimes(1);
          expect(result.cancel).toBe(false);
          expect(result.responseHeaders).toBe(responseHeaders);
          done();
        },
      );
    },
  );
});
