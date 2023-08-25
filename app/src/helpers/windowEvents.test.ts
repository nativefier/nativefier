jest.mock('./helpers');
jest.mock('./windowEvents');
jest.mock('./windowHelpers');

import { dialog, BrowserWindow, HandlerDetails, WebContents } from 'electron';
import { WindowOptions } from '../../../shared/src/options/model';
import { linkIsInternal, openExternal, nativeTabsSupported } from './helpers';
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const {
  onNewWindowHelper,
  onWillNavigate,
  onWillPreventUnload,
}: {
  onNewWindowHelper: (
    options: WindowOptions,
    setupWindow: (options: WindowOptions, window: BrowserWindow) => void,
    details: Partial<HandlerDetails>,
    parent?: BrowserWindow,
  ) => ReturnType<Parameters<WebContents['setWindowOpenHandler']>[0]>;
  onWillNavigate: (
    options: {
      blockExternalUrls: boolean;
      internalUrls?: string | RegExp;
      targetUrl: string;
    },
    event: unknown,
    urlToGo: string,
  ) => Promise<void>;
  onWillPreventUnload: (event: unknown) => void;
} = jest.requireActual('./windowEvents');
import {
  showNavigationBlockedMessage,
  createAboutBlankWindow,
  createNewTab,
} from './windowHelpers';

describe('onNewWindowHelper', () => {
  const originalURL = 'https://medium.com/';
  const internalURL = 'https://medium.com/topics/technology';
  const externalURL = 'https://www.wikipedia.org/wiki/Electron';
  const foregroundDisposition = 'foreground-tab';
  const backgroundDisposition = 'background-tab';
  const baseOptions = {
    autoHideMenuBar: true,
    blockExternalUrls: false,
    insecure: false,
    name: 'TEST_APP',
    targetUrl: originalURL,
    zoom: 1.0,
  } as WindowOptions;
  const mockShowNavigationBlockedMessage: jest.SpyInstance =
    showNavigationBlockedMessage as jest.Mock;
  const mockCreateAboutBlank: jest.SpyInstance =
    createAboutBlankWindow as jest.Mock;
  const mockCreateNewTab: jest.SpyInstance = createNewTab as jest.Mock;
  const mockLinkIsInternal: jest.SpyInstance = (
    linkIsInternal as jest.Mock
  ).mockImplementation(() => true);
  const mockNativeTabsSupported: jest.SpyInstance =
    nativeTabsSupported as jest.Mock;
  const mockOpenExternal: jest.SpyInstance = openExternal as jest.Mock;
  const setupWindow = jest.fn();

  beforeEach(() => {
    mockShowNavigationBlockedMessage
      .mockReset()
      .mockReturnValue(Promise.resolve(undefined));
    mockCreateAboutBlank.mockReset();
    mockCreateNewTab.mockReset();
    mockLinkIsInternal.mockReset().mockReturnValue(true);
    mockNativeTabsSupported.mockReset().mockReturnValue(false);
    mockOpenExternal.mockReset();
    setupWindow.mockReset();
  });

  afterAll(() => {
    mockShowNavigationBlockedMessage.mockRestore();
    mockCreateAboutBlank.mockRestore();
    mockCreateNewTab.mockRestore();
    mockLinkIsInternal.mockRestore();
    mockNativeTabsSupported.mockRestore();
    mockOpenExternal.mockRestore();
  });

  test('internal urls should not be handled', () => {
    const result = onNewWindowHelper(baseOptions, setupWindow, {
      url: internalURL,
    });

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(result.action).toEqual('allow');
  });

  test('external urls should be opened externally', () => {
    mockLinkIsInternal.mockReturnValue(false);

    const result = onNewWindowHelper(baseOptions, setupWindow, {
      url: externalURL,
    });

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).toHaveBeenCalledTimes(1);
    expect(result.action).toEqual('deny');
  });

  test('external urls should be ignored if blockExternalUrls is true', () => {
    mockLinkIsInternal.mockReturnValue(false);
    const options = {
      ...baseOptions,
      blockExternalUrls: true,
    };
    const result = onNewWindowHelper(options, setupWindow, {
      url: externalURL,
    });

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockShowNavigationBlockedMessage).toHaveBeenCalledTimes(1);
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(result.action).toEqual('deny');
  });

  test('tab disposition should be ignored if tabs are not enabled', () => {
    const result = onNewWindowHelper(baseOptions, setupWindow, {
      url: internalURL,
      disposition: foregroundDisposition,
    });

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(result.action).toEqual('allow');
  });

  test('tab disposition should be ignored if url is external', () => {
    mockLinkIsInternal.mockReturnValue(false);

    const result = onNewWindowHelper(baseOptions, setupWindow, {
      url: externalURL,
      disposition: foregroundDisposition,
    });

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).toHaveBeenCalledTimes(1);
    expect(result.action).toEqual('deny');
  });

  test('foreground tabs with internal urls should be opened in the foreground', () => {
    mockNativeTabsSupported.mockReturnValue(true);

    const result = onNewWindowHelper(baseOptions, setupWindow, {
      url: internalURL,
      disposition: foregroundDisposition,
    });

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).toHaveBeenCalledWith(
      baseOptions,
      setupWindow,
      internalURL,
      true,
    );
    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(result.action).toEqual('deny');
  });

  test('background tabs with internal urls should be opened in background tabs', () => {
    mockNativeTabsSupported.mockReturnValue(true);

    const result = onNewWindowHelper(baseOptions, setupWindow, {
      url: internalURL,
      disposition: backgroundDisposition,
    });

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).toHaveBeenCalledWith(
      baseOptions,
      setupWindow,
      internalURL,
      false,
    );
    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(result.action).toEqual('deny');
  });

  test('about:blank urls should be handled', () => {
    const result = onNewWindowHelper(baseOptions, setupWindow, {
      url: 'about:blank',
    });

    expect(mockCreateAboutBlank).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(result.action).toEqual('deny');
  });

  test('about:blank#blocked urls should be handled', () => {
    const result = onNewWindowHelper(baseOptions, setupWindow, {
      url: 'about:blank#blocked',
    });

    expect(mockCreateAboutBlank).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(result.action).toEqual('deny');
  });

  test('about:blank#other urls should not be handled', () => {
    const result = onNewWindowHelper(baseOptions, setupWindow, {
      url: 'about:blank#other',
    });

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(result.action).toEqual('allow');
  });
});

describe('onWillNavigate', () => {
  const originalURL = 'https://medium.com/';
  const internalURL = 'https://medium.com/topics/technology';
  const externalURL = 'https://www.wikipedia.org/wiki/Electron';

  const mockShowNavigationBlockedMessage: jest.SpyInstance =
    showNavigationBlockedMessage as jest.Mock;
  const mockLinkIsInternal: jest.SpyInstance = linkIsInternal as jest.Mock;
  const mockOpenExternal: jest.SpyInstance = openExternal as jest.Mock;
  const preventDefault = jest.fn();

  beforeEach(() => {
    mockShowNavigationBlockedMessage
      .mockReset()
      .mockReturnValue(Promise.resolve(undefined));
    mockLinkIsInternal.mockReset().mockReturnValue(false);
    mockOpenExternal.mockReset();
    preventDefault.mockReset();
  });

  afterAll(() => {
    mockShowNavigationBlockedMessage.mockRestore();
    mockLinkIsInternal.mockRestore();
    mockOpenExternal.mockRestore();
  });

  test('internal urls should not be handled', async () => {
    mockLinkIsInternal.mockReturnValue(true);
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    const event = { preventDefault };
    await onWillNavigate(options, event, internalURL);

    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('external urls should be opened externally', async () => {
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    const event = { preventDefault };
    await onWillNavigate(options, event, externalURL);

    expect(mockShowNavigationBlockedMessage).not.toHaveBeenCalled();
    expect(mockOpenExternal).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('external urls should be blocked if blockExternalUrls is true', async () => {
    const options = {
      blockExternalUrls: true,
      targetUrl: originalURL,
    };
    const event = { preventDefault };
    await onWillNavigate(options, event, externalURL);

    expect(mockShowNavigationBlockedMessage).toHaveBeenCalledTimes(1);
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

    const event = { preventDefault, sender: {} };
    onWillPreventUnload(event);

    expect(mockFromWebContents).toHaveBeenCalledWith(event.sender);
    expect(mockShowDialog).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledWith();
  });

  test('shows dialog and does not call preventDefault on cancel', () => {
    mockShowDialog.mockReturnValue(1);

    const event = { preventDefault, sender: {} };
    onWillPreventUnload(event);

    expect(mockFromWebContents).toHaveBeenCalledWith(event.sender);
    expect(mockShowDialog).toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
