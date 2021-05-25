import {
  dialog,
  BrowserWindow,
  HeadersReceivedResponse,
  WebContents,
} from 'electron';
jest.mock('loglevel');
import { error } from 'loglevel';

jest.mock('./helpers');
import { getCSSToInject, shouldInjectCSS } from './helpers';
jest.mock('./windowEvents');
import { clearAppData, injectCSS } from './windowHelpers';

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

describe('injectCSS', () => {
  const mockGetCSSToInject: jest.SpyInstance = getCSSToInject as jest.Mock;
  const mockLogError: jest.SpyInstance = error as jest.Mock;
  const mockShouldInjectCSS: jest.SpyInstance = shouldInjectCSS as jest.Mock;
  const mockWebContentsInsertCSS: jest.SpyInstance = jest.spyOn(
    WebContents.prototype,
    'insertCSS',
  );

  const css = 'body { color: white; }';
  const responseHeaders = { 'x-header': 'value' };

  beforeEach(() => {
    mockGetCSSToInject.mockReset().mockReturnValue('');
    mockLogError.mockReset();
    mockShouldInjectCSS.mockReset().mockReturnValue(true);
    mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
  });

  afterAll(() => {
    mockGetCSSToInject.mockRestore();
    mockLogError.mockRestore();
    mockShouldInjectCSS.mockRestore();
    mockWebContentsInsertCSS.mockRestore();
  });

  test('will not inject if shouldInjectCSS is false', () => {
    mockShouldInjectCSS.mockReturnValue(false);

    const window = new BrowserWindow();

    injectCSS(window);

    expect(mockGetCSSToInject).not.toHaveBeenCalled();
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
          'webContents.insertCSS ERROR',
          'css insertion error',
        );
        expect(result.cancel).toBe(false);
        expect(result.responseHeaders).toBe(responseHeaders);
        done();
      },
    );
  });
});
