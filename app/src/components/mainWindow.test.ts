jest.mock('../helpers/windowHelpers');

import { MainWindow } from './mainWindow';
import * as helpers from '../helpers/helpers';
import { createAboutBlankWindow, createNewTab } from '../helpers/windowHelpers';

describe('onNewWindowHelper', () => {
  const originalUrl = 'https://medium.com/';
  const internalUrl = 'https://medium.com/topics/technology';
  const externalUrl = 'https://www.wikipedia.org/wiki/Electron';
  const foregroundDisposition = 'foreground-tab';
  const backgroundDisposition = 'background-tab';

  const mockCreateAboutBlank: jest.SpyInstance =
    createAboutBlankWindow as jest.Mock;
  const mockCreateNewTab: jest.SpyInstance = createNewTab as jest.Mock;
  let mockNativeTabsSupported: jest.SpyInstance = jest
    .spyOn(helpers, 'nativeTabsSupported')
    .mockImplementation(() => false);
  let mockOnBlockedExternal: jest.SpyInstance;
  const mockOpenExternal: jest.SpyInstance = jest.spyOn(
    helpers,
    'openExternal',
  );
  const preventDefault = jest.fn();

  beforeEach(() => {
    mockNativeTabsSupported.mockImplementation(() => false);
    mockOnBlockedExternal = jest
      .spyOn(MainWindow, 'onBlockedExternalUrl')
      .mockImplementation();
  });

  afterEach(() => {
    mockCreateAboutBlank.mockReset();
    mockCreateNewTab.mockReset();
    mockNativeTabsSupported.mockReset();
    mockOnBlockedExternal.mockReset();
    mockOpenExternal.mockReset();

    preventDefault.mockReset();
  });

  test('internal urls should not be handled', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };

    MainWindow.onNewWindowHelper(
      options,
      internalUrl,
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockOnBlockedExternal).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('external urls should be opened externally', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };
    MainWindow.onNewWindowHelper(
      options,
      externalUrl,
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockOnBlockedExternal).not.toHaveBeenCalled();
    expect(mockOpenExternal).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('external urls should be ignored if blockExternalUrls is true', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: true,
    };
    MainWindow.onNewWindowHelper(
      options,
      externalUrl,
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockOnBlockedExternal).toHaveBeenCalledTimes(1);
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('tab disposition should be ignored if tabs are not enabled', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };
    MainWindow.onNewWindowHelper(
      options,
      internalUrl,
      foregroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockOnBlockedExternal).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('tab disposition should be ignored if url is external', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };
    MainWindow.onNewWindowHelper(
      options,
      externalUrl,
      foregroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockOnBlockedExternal).not.toHaveBeenCalled();
    expect(mockOpenExternal).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('foreground tabs with internal urls should be opened in the foreground', () => {
    mockNativeTabsSupported = mockNativeTabsSupported.mockImplementation(
      () => true,
    );

    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };
    MainWindow.onNewWindowHelper(
      options,
      internalUrl,
      foregroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).toHaveBeenCalledWith(
      options,
      MainWindow.getDefaultWindowOptions(options),
      MainWindow.setupWindow,
      internalUrl,
      true,
      undefined,
    );
    expect(mockOnBlockedExternal).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('background tabs with internal urls should be opened in background tabs', () => {
    mockNativeTabsSupported = mockNativeTabsSupported.mockImplementation(
      () => true,
    );

    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };
    MainWindow.onNewWindowHelper(
      options,
      internalUrl,
      backgroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).toHaveBeenCalledWith(
      options,
      MainWindow.getDefaultWindowOptions(options),
      MainWindow.setupWindow,
      internalUrl,
      false,
      undefined,
    );
    expect(mockOnBlockedExternal).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('about:blank urls should be handled', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };
    MainWindow.onNewWindowHelper(
      options,
      'about:blank',
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockOnBlockedExternal).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
