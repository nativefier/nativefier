jest.mock('../helpers/windowEvents');
jest.mock('../helpers/windowHelpers');

import { MainWindow } from './mainWindow';
import * as helpers from '../helpers/helpers';
const { onNewWindowHelper } = jest.requireActual('../helpers/windowEvents');
import {
  blockExternalUrl,
  createAboutBlankWindow,
  createNewTab,
} from '../helpers/windowHelpers';

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
  const mockBlockExternalUrl: jest.SpyInstance = blockExternalUrl as jest.Mock;
  const mockOpenExternal: jest.SpyInstance = jest
    .spyOn(helpers, 'openExternal')
    .mockImplementation();
  const preventDefault = jest.fn();

  beforeEach(() => {
    mockNativeTabsSupported.mockImplementation(() => false);
  });

  afterEach(() => {
    mockCreateAboutBlank.mockReset();
    mockCreateNewTab.mockReset();
    mockNativeTabsSupported.mockReset();
    mockBlockExternalUrl.mockReset();
    mockOpenExternal.mockReset();

    preventDefault.mockReset();
  });

  test('internal urls should not be handled', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };

    onNewWindowHelper(
      options,
      MainWindow.setupWindow,
      internalUrl,
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalUrl).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('external urls should be opened externally', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };
    onNewWindowHelper(
      options,
      MainWindow.setupWindow,
      externalUrl,
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalUrl).not.toHaveBeenCalled();
    expect(mockOpenExternal).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('external urls should be ignored if blockExternalUrls is true', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: true,
    };
    onNewWindowHelper(
      options,
      MainWindow.setupWindow,
      externalUrl,
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalUrl).toHaveBeenCalledTimes(1);
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('tab disposition should be ignored if tabs are not enabled', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };
    onNewWindowHelper(
      options,
      MainWindow.setupWindow,
      internalUrl,
      foregroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalUrl).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  test('tab disposition should be ignored if url is external', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };
    onNewWindowHelper(
      options,
      MainWindow.setupWindow,
      externalUrl,
      foregroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalUrl).not.toHaveBeenCalled();
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
    onNewWindowHelper(
      options,
      MainWindow.setupWindow,
      internalUrl,
      foregroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).toHaveBeenCalledWith(
      options,
      MainWindow.setupWindow,
      internalUrl,
      true,
      undefined,
    );
    expect(mockBlockExternalUrl).not.toHaveBeenCalled();
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
    onNewWindowHelper(
      options,
      MainWindow.setupWindow,
      internalUrl,
      backgroundDisposition,
      preventDefault,
    );

    expect(mockCreateAboutBlank).not.toHaveBeenCalled();
    expect(mockCreateNewTab).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).toHaveBeenCalledWith(
      options,
      MainWindow.setupWindow,
      internalUrl,
      false,
      undefined,
    );
    expect(mockBlockExternalUrl).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  test('about:blank urls should be handled', () => {
    const options = {
      targetUrl: originalUrl,
      blockExternalUrls: false,
    };
    onNewWindowHelper(
      options,
      MainWindow.setupWindow,
      'about:blank',
      undefined,
      preventDefault,
    );

    expect(mockCreateAboutBlank).toHaveBeenCalledTimes(1);
    expect(mockCreateNewTab).not.toHaveBeenCalled();
    expect(mockBlockExternalUrl).not.toHaveBeenCalled();
    expect(mockOpenExternal).not.toHaveBeenCalled();
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });
});
