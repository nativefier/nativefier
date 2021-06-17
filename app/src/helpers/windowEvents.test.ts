jest.mock('./helpers');
jest.mock('./windowEvents');
jest.mock('./windowHelpers');

import { dialog, BrowserWindow, WebContents } from 'electron';
import { linkIsInternal, openExternal, nativeTabsSupported } from './helpers';
const { onNewWindowHelper, onWillNavigate, onWillPreventUnload } =
  jest.requireActual('./windowEvents');
import {
  blockExternalURL,
  createAboutBlankWindow,
  createNewTab,
} from './windowHelpers';

describe('onNewWindowHelper', () => {
  const originalURL = 'https://medium.com/';
  const internalURL = 'https://medium.com/topics/technology';
  const externalURL = 'https://www.wikipedia.org/wiki/Electron';
  const foregroundDisposition = 'foreground-tab';
  const backgroundDisposition = 'background-tab';

  const mockBlockExternalURL: jest.SpyInstance = blockExternalURL as jest.Mock;
  const mockCreateAboutBlank: jest.SpyInstance =
    createAboutBlankWindow as jest.Mock;
  const mockCreateNewTab: jest.SpyInstance = createNewTab as jest.Mock;
  const mockLinkIsInternal: jest.SpyInstance = (
    linkIsInternal as jest.Mock
  ).mockImplementation(() => true);
  const mockNativeTabsSupported: jest.SpyInstance =
    nativeTabsSupported as jest.Mock;
  const mockOpenExternal: jest.SpyInstance = openExternal as jest.Mock;
  const preventDefault = jest.fn();
  const setupWindow = jest.fn();

  beforeEach(() => {
    mockBlockExternalURL
      .mockReset()
      .mockReturnValue(Promise.resolve(undefined));
    mockCreateAboutBlank.mockReset();
    mockCreateNewTab.mockReset();
    mockLinkIsInternal.mockReset().mockReturnValue(true);
    mockNativeTabsSupported.mockReset().mockReturnValue(false);
    mockOpenExternal.mockReset();
    preventDefault.mockReset();
    setupWindow.mockReset();
  });

  afterAll(() => {
    mockBlockExternalURL.mockRestore();
    mockCreateAboutBlank.mockRestore();
    mockCreateNewTab.mockRestore();
    mockLinkIsInternal.mockRestore();
    mockNativeTabsSupported.mockRestore();
    mockOpenExternal.mockRestore();
  });

  test('internal urls should not be handled', () => {
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };

    onNewWindowHelper(
      options,
      setupWindow,
      internalURL,
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('external urls should be opened externally', () => {
    mockLinkIsInternal.mockReturnValue(false);
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    onNewWindowHelper(
      options,
      setupWindow,
      externalURL,
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('external urls should be ignored if blockExternalUrls is true', () => {
    mockLinkIsInternal.mockReturnValue(false);
    const options = {
      blockExternalUrls: true,
      targetUrl: originalURL,
    };
    onNewWindowHelper(
      options,
      setupWindow,
      externalURL,
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalURL).toHaveBeenCalledTimes(1);
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('tab disposition should be ignored if tabs are not enabled', () => {
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    onNewWindowHelper(
      options,
      setupWindow,
      internalURL,
      foregroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('tab disposition should be ignored if url is external', () => {
    mockLinkIsInternal.mockReturnValue(false);
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    onNewWindowHelper(
      options,
      setupWindow,
      externalURL,
      foregroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('foreground tabs with internal urls should be opened in the foreground', () => {
    mockNativeTabsSupported.mockReturnValue(true);

    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    onNewWindowHelper(
      options,
      setupWindow,
      internalURL,
      foregroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).toHaveBeenCalledWith(
      options,
      setupWindow,
      internalURL,
      true,
      undefined,
    );
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('background tabs with internal urls should be opened in background tabs', () => {
    mockNativeTabsSupported.mockReturnValue(true);

    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    onNewWindowHelper(
      options,
      setupWindow,
      internalURL,
      backgroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).toHaveBeenCalledWith(
      options,
      setupWindow,
      internalURL,
      false,
      undefined,
    );
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('about:blank urls should be handled', () => {
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    onNewWindowHelper(
      options,
      setupWindow,
      'about:blank',
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('about:blank#blocked urls should be handled', () => {
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    onNewWindowHelper(
      options,
      setupWindow,
      'about:blank#blocked',
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('about:blank#other urls should not be handled', () => {
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    onNewWindowHelper(
      options,
      setupWindow,
      'about:blank#other',
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});

describe('onWillNavigate', () => {
  const originalURL = 'https://medium.com/';
  const internalURL = 'https://medium.com/topics/technology';
  const externalURL = 'https://www.wikipedia.org/wiki/Electron';

  const mockBlockExternalURL: jest.SpyInstance = blockExternalURL as jest.Mock;
  const mockLinkIsInternal: jest.SpyInstance = linkIsInternal as jest.Mock;
  const mockOpenExternal: jest.SpyInstance = openExternal as jest.Mock;
  const preventDefault = jest.fn();

  beforeEach(() => {
    mockBlockExternalURL
      .mockReset()
      .mockReturnValue(Promise.resolve(undefined));
    mockLinkIsInternal.mockReset().mockReturnValue(false);
    mockOpenExternal.mockReset();
    preventDefault.mockReset();
  });

  afterAll(() => {
    mockBlockExternalURL.mockRestore();
    mockLinkIsInternal.mockRestore();
    mockOpenExternal.mockRestore();
  });

  test('internal urls should not be handled', () => {
    mockLinkIsInternal.mockReturnValue(true);
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    const event = { preventDefault };
    onWillNavigate(options, event, internalURL);

    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('external urls should be opened externally', () => {
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    const event = { preventDefault };
    onWillNavigate(options, event, externalURL);

    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('external urls should be ignored if blockExternalUrls is true', () => {
    const options = {
      blockExternalUrls: true,
      targetUrl: originalURL,
    };
    const event = { preventDefault };
    onWillNavigate(options, event, externalURL);

    expect(mockBlockExternalURL).toHaveBeenCalledTimes(1);
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});

describe('onWillPreventUnload', () => {
  const mockFromWebContents: jest.SpyInstance = jest
    .spyOn(BrowserWindow, 'fromWebContents')
    .mockImplementation(() => new BrowserWindow());
  const mockShowDialog: jest.SpyInstance = jest.spyOn(
    dialog,
    'showMessageBoxSync',
  );
  const preventDefault: jest.SpyInstance = jest.fn();

  beforeEach(() => {
    mockFromWebContents.mockReset();
    mockShowDialog.mockReset().mockReturnValue(undefined);
    preventDefault.mockReset();
  });

  afterAll(() => {
    mockFromWebContents.mockRestore();
    mockShowDialog.mockRestore();
  });

  test('with no sender', () => {
    const event = {};
    onWillPreventUnload(event);

    expect(mockFromWebContents).not.toHaveBeenCalled();
    expect(mockShowDialog).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('shows dialog and calls preventDefault on ok', () => {
    mockShowDialog.mockReturnValue(0);

    const event = { preventDefault, sender: new WebContents() };
    onWillPreventUnload(event);

    expect(mockFromWebContents).toHaveBeenCalledWith(event.sender);
    expect(mockShowDialog).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledWith();
  });

  test('shows dialog and does not call preventDefault on cancel', () => {
    mockShowDialog.mockReturnValue(1);

    const event = { preventDefault, sender: new WebContents() };
    onWillPreventUnload(event);

    expect(mockFromWebContents).toHaveBeenCalledWith(event.sender);
    expect(mockShowDialog).toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
