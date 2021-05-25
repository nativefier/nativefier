import { BrowserWindow, HeadersReceivedResponse, WebContents } from 'electron';
jest.mock('loglevel');
import { error } from 'loglevel';

jest.mock('./helpers');
import { getCSSToInject, shouldInjectCSS } from './helpers';
jest.mock('./windowEvents');
import { injectCSS } from './windowHelpers';

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
