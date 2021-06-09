import {
  dialog,
  BrowserWindow,
  HeadersReceivedResponse,
  WebContents,
} from 'electron';
jest.mock('loglevel');
import { error } from 'loglevel';

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
  const options = {};
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
  const mockGetCSSToInject: jest.SpyInstance = getCSSToInject as jest.Mock;
  const mockLogError: jest.SpyInstance = error as jest.Mock;
  const mockWebContentsInsertCSS: jest.SpyInstance = jest.spyOn(
    WebContents.prototype,
    'insertCSS',
  );

  const css = 'body { color: white; }';
  const responseHeaders = { 'x-header': 'value' };

  beforeEach(() => {
    mockGetCSSToInject.mockReset().mockReturnValue('');
    mockLogError.mockReset();
    mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
  });

  afterAll(() => {
    mockGetCSSToInject.mockRestore();
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
    // @ts-ignore this function doesn't exist in the actual electron version, but will in our mock
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
    // @ts-ignore this function doesn't exist in the actual electron version, but will in our mock
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

  test.each<string | jest.DoneCallback>(['DELETE', 'OPTIONS'])(
    'will not inject for method %s',
    (method: string, done: jest.DoneCallback) => {
      mockGetCSSToInject.mockReturnValue(css);
      const window = new BrowserWindow();

      injectCSS(window);

      expect(mockGetCSSToInject).toHaveBeenCalled();

      window.webContents.emit('did-navigate');
      // @ts-ignore this function doesn't exist in the actual electron version, but will in our mock
      window.webContents.session.webRequest.send(
        'onHeadersReceived',
        { responseHeaders, webContents: window.webContents, method },
        (result: HeadersReceivedResponse) => {
          expect(mockWebContentsInsertCSS).not.toHaveBeenCalled();
          expect(result.cancel).toBe(false);
          expect(result.responseHeaders).toBe(responseHeaders);
          done();
        },
      );
    },
  );

  test.each<string | jest.DoneCallback>(['GET', 'PATCH', 'POST', 'PUT'])(
    'will inject for method %s',
    (method: string, done: jest.DoneCallback) => {
      mockGetCSSToInject.mockReturnValue(css);
      const window = new BrowserWindow();

      injectCSS(window);

      expect(mockGetCSSToInject).toHaveBeenCalled();

      window.webContents.emit('did-navigate');
      // @ts-ignore this function doesn't exist in the actual electron version, but will in our mock
      window.webContents.session.webRequest.send(
        'onHeadersReceived',
        { responseHeaders, webContents: window.webContents, method },
        (result: HeadersReceivedResponse) => {
          expect(mockWebContentsInsertCSS).toHaveBeenCalled();
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
    (resourceType: string, done: jest.DoneCallback) => {
      mockGetCSSToInject.mockReturnValue(css);
      const window = new BrowserWindow();

      injectCSS(window);

      expect(mockGetCSSToInject).toHaveBeenCalled();

      window.webContents.emit('did-navigate');
      // @ts-ignore this function doesn't exist in the actual electron version, but will in our mock
      window.webContents.session.webRequest.send(
        'onHeadersReceived',
        { responseHeaders, webContents: window.webContents, resourceType },
        (result: HeadersReceivedResponse) => {
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
    (resourceType: string, done: jest.DoneCallback) => {
      mockGetCSSToInject.mockReturnValue(css);
      const window = new BrowserWindow();

      injectCSS(window);

      expect(mockGetCSSToInject).toHaveBeenCalled();

      window.webContents.emit('did-navigate');
      // @ts-ignore this function doesn't exist in the actual electron version, but will in our mock
      window.webContents.session.webRequest.send(
        'onHeadersReceived',
        { responseHeaders, webContents: window.webContents, resourceType },
        (result: HeadersReceivedResponse) => {
          expect(mockWebContentsInsertCSS).toHaveBeenCalled();
          expect(result.cancel).toBe(false);
          expect(result.responseHeaders).toBe(responseHeaders);
          done();
        },
      );
    },
  );
});
