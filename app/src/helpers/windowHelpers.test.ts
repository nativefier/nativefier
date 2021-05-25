jest.mock('./helpers');
jest.mock('./windowEvents');

import { BrowserWindow, WebContents } from 'electron';

import { getCSSToInject, shouldInjectCSS } from './helpers';
import { injectCSS } from './windowHelpers';

describe('injectCSS', () => {
  console.log({ WebContents });

  const mockGetCSSToInject: jest.SpyInstance = getCSSToInject as jest.Mock;
  const mockShouldInjectCSS: jest.SpyInstance = shouldInjectCSS as jest.Mock;
  const mockWebContentsInsertCSS: jest.SpyInstance = jest
    .spyOn(WebContents.prototype, 'insertCSS')
    .mockImplementation();

  beforeEach(() => {
    mockGetCSSToInject.mockReset().mockReturnValue('');
    mockShouldInjectCSS.mockReset().mockReturnValue(true);
    mockWebContentsInsertCSS.mockReset().mockResolvedValue(undefined);
  });

  afterAll(() => {
    mockGetCSSToInject.mockRestore();
    mockShouldInjectCSS.mockRestore();
    mockWebContentsInsertCSS.mockRestore();
  });

  test('will not inject if shouldInjectCSS is false', () => {
    mockShouldInjectCSS.mockReturnValue(false);

    const window = new BrowserWindow();

    injectCSS(window);

    expect(mockGetCSSToInject).not.toHaveBeenCalled();
  });

  test('will inject on did-navigate + onHeadersReceived', () => {
    const css = 'body { color: white; }';
    mockGetCSSToInject.mockReturnValue(css);
    const window = new BrowserWindow();

    injectCSS(window);

    expect(mockGetCSSToInject).toHaveBeenCalled();

    window.webContents.emit('did-navigate');
    // @ts-ignore this function doesn't exist in the actual electron version, but will in our mock
    window.webContents.session.webRequest.send(
      'onHeadersReceived',
      { webContents: window.webContents },
      () => {
        expect(mockWebContentsInsertCSS).toHaveBeenCalledWith(css);
      },
    );
  });
});
