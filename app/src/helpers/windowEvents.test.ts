jest.mock('./helpers');
jest.mock('./windowEvents');
jest.mock('./windowHelpers');

import { dialog, BrowserWindow } from 'electron';
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
    urlToGo: string,
    disposition: string | undefined,
    preventDefault: (newGuest: BrowserWindow) => void,
    parent?: BrowserWindow,
  ) => Promise<void>;
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
  const baseOptions = {
    blockExternalUrls: false,
    insecure: false,
    name: 'TEST_APP',
    targetUrl: originalURL,
    zoom: 1.0,
  };
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

  test('internal urls should not be handled', async () => {
    await onNewWindowHelper(
      baseOptions,
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

  test('external urls should be opened externally', async () => {
    mockLinkIsInternal.mockReturnValue(false);

    await onNewWindowHelper(
      baseOptions,
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

  test('external urls should be ignored if blockExternalUrls is true', async () => {
    mockLinkIsInternal.mockReturnValue(false);
    const options = {
      ...baseOptions,
      blockExternalUrls: true,
    };
    await onNewWindowHelper(
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

  test('tab disposition should be ignored if tabs are not enabled', async () => {
    await onNewWindowHelper(
      baseOptions,
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

  test('tab disposition should be ignored if url is external', async () => {
    mockLinkIsInternal.mockReturnValue(false);

    await onNewWindowHelper(
      baseOptions,
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

  test('foreground tabs with internal urls should be opened in the foreground', async () => {
    mockNativeTabsSupported.mockReturnValue(true);

    await onNewWindowHelper(
      baseOptions,
      setupWindow,
      internalURL,
      foregroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).toHaveBeenCalledWith(
      baseOptions,
      setupWindow,
      internalURL,
      true,
      undefined,
    );
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('background tabs with internal urls should be opened in background tabs', async () => {
    mockNativeTabsSupported.mockReturnValue(true);

    await onNewWindowHelper(
      baseOptions,
      setupWindow,
      internalURL,
      backgroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).toHaveBeenCalledWith(
      baseOptions,
      setupWindow,
      internalURL,
      false,
      undefined,
    );
    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('about:blank urls should be handled', async () => {
    await onNewWindowHelper(
      baseOptions,
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

  test('about:blank#blocked urls should be handled', async () => {
    await onNewWindowHelper(
      baseOptions,
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

  test('about:blank#other urls should not be handled', async () => {
    await onNewWindowHelper(
      baseOptions,
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

  test('internal urls should not be handled', async () => {
    mockLinkIsInternal.mockReturnValue(true);
    const options = {
      blockExternalUrls: false,
      targetUrl: originalURL,
    };
    const event = { preventDefault };
    await onWillNavigate(options, event, internalURL);

    expect(mockBlockExternalURL).not.toHaveBeenCalled();
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

    expect(mockBlockExternalURL).not.toHaveBeenCalled();
    expect(mockOpenExternal).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('external urls should be ignored if blockExternalUrls is true', async () => {
    const options = {
      blockExternalUrls: true,
      targetUrl: originalURL,
    };
    const event = { preventDefault };
    await onWillNavigate(options, event, externalURL);

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
