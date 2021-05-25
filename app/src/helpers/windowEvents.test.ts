jest.mock('../helpers/windowEvents');
jest.mock('../helpers/windowHelpers');

import { dialog, BrowserWindow, WebContents } from 'electron';
import * as helpers from './helpers';
const { onNewWindowHelper, onWillPreventUnload } =
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

  const mockCreateAboutBlank: jest.SpyInstance =
    createAboutBlankWindow as jest.Mock;
  const mockCreateNewTab: jest.SpyInstance = createNewTab as jest.Mock;
  let mockNativeTabsSupported: jest.SpyInstance = jest
    .spyOn(helpers, 'nativeTabsSupported')
    .mockImplementation(() => false);
  const mockBlockExternalURL: jest.SpyInstance = blockExternalURL as jest.Mock;
  const mockOpenExternal: jest.SpyInstance = jest
    .spyOn(helpers, 'openExternal')
    .mockImplementation();
  const preventDefault = jest.fn();
  const setupWindow = jest.fn();

  beforeEach(() => {
    mockNativeTabsSupported.mockImplementation(() => false);
  });

  afterEach(() => {
    mockCreateAboutBlank.mockReset();
    mockCreateNewTab.mockReset();
    mockNativeTabsSupported.mockReset();
    mockBlockExternalURL.mockReset();
    mockOpenExternal.mockReset();
    preventDefault.mockReset();
    setupWindow.mockReset();
  });

  afterAll(() => {
    mockCreateAboutBlank.mockRestore();
    mockCreateNewTab.mockRestore();
    mockNativeTabsSupported.mockRestore();
    mockBlockExternalURL.mockRestore();
    mockOpenExternal.mockRestore();
  });

  test('internal urls should not be handled', () => {
    const options = {
      targetUrl: originalURL,
      blockExternalUrls: false,
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
    const options = {
      targetUrl: originalURL,
      blockExternalUrls: false,
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
    const options = {
      targetUrl: originalURL,
      blockExternalUrls: true,
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
      targetUrl: originalURL,
      blockExternalUrls: false,
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
    const options = {
      targetUrl: originalURL,
      blockExternalUrls: false,
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
    mockNativeTabsSupported = mockNativeTabsSupported.mockImplementation(
      () => true,
    );

    const options = {
      targetUrl: originalURL,
      blockExternalUrls: false,
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
    mockNativeTabsSupported = mockNativeTabsSupported.mockImplementation(
      () => true,
    );

    const options = {
      targetUrl: originalURL,
      blockExternalUrls: false,
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
      targetUrl: originalURL,
      blockExternalUrls: false,
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
});

describe('onWillPreventUnload', () => {
  const mockFromWebContents: jest.SpyInstance = jest
    .spyOn(BrowserWindow, 'fromWebContents')
    .mockImplementation(() => new BrowserWindow());
  const mockShowDialog: jest.SpyInstance = jest
    .spyOn(dialog, 'showMessageBoxSync')
    .mockImplementation();
  const preventDefault: jest.SpyInstance = jest.fn();

  afterEach(() => {
    mockFromWebContents.mockReset();
    mockShowDialog.mockReset();
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
    mockShowDialog.mockImplementation(() => 0);

    const event = { preventDefault, sender: new WebContents() };
    onWillPreventUnload(event);

    expect(mockFromWebContents).toHaveBeenCalledWith(event.sender);
    expect(mockShowDialog).toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledWith();
  });

  test('shows dialog and does not call preventDefault on cancel', () => {
    mockShowDialog.mockImplementation(() => 1);

    const event = { preventDefault, sender: new WebContents() };
    onWillPreventUnload(event);

    expect(mockFromWebContents).toHaveBeenCalledWith(event.sender);
    expect(mockShowDialog).toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});
