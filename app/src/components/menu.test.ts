import { BrowserWindow, MenuItemConstructorOptions } from 'electron';

jest.mock('../helpers/helpers');
import { isOSX } from '../helpers/helpers';
import { generateMenu } from './menu';

describe('generateMenu', () => {
  let window: BrowserWindow;
  const mockIsOSX: jest.SpyInstance = isOSX as jest.Mock;
  let mockIsFullScreen: jest.SpyInstance;
  let mockIsFullScreenable: jest.SpyInstance;
  let mockIsSimpleFullScreen: jest.SpyInstance;
  let mockSetFullScreen: jest.SpyInstance;
  let mockSetSimpleFullScreen: jest.SpyInstance;

  beforeEach(() => {
    window = new BrowserWindow();
    mockIsOSX.mockReset();
    mockIsFullScreen = jest
      .spyOn(window, 'isFullScreen')
      .mockReturnValue(false);
    mockIsFullScreenable = jest
      .spyOn(window, 'isFullScreenable')
      .mockReturnValue(true);
    mockIsSimpleFullScreen = jest
      .spyOn(window, 'isSimpleFullScreen')
      .mockReturnValue(false);
    mockSetFullScreen = jest.spyOn(window, 'setFullScreen');
    mockSetSimpleFullScreen = jest.spyOn(window, 'setSimpleFullScreen');
  });

  afterAll(() => {
    mockIsFullScreen.mockRestore();
    mockIsFullScreenable.mockRestore();
    mockIsSimpleFullScreen.mockRestore();
    mockSetFullScreen.mockRestore();
    mockSetSimpleFullScreen.mockRestore();
  });

  test('does not have fullscreen if not supported', () => {
    mockIsOSX.mockReturnValue(false);
    mockIsFullScreenable.mockReturnValue(false);

    const menu = generateMenu(
      {
        nativefierVersion: '1.0.0',
        zoom: 1.0,
        disableDevTools: false,
      },
      window,
    );

    const editMenu = menu.filter((item) => item.label === '&View');

    const fullscreen = (
      editMenu[0].submenu as MenuItemConstructorOptions[]
    ).filter((item) => item.label === 'Toggle Full Screen');

    expect(fullscreen).toHaveLength(1);
    expect(fullscreen[0].enabled).toBe(false);
    expect(fullscreen[0].visible).toBe(false);

    expect(mockIsOSX).toHaveBeenCalled();
    expect(mockIsFullScreenable).toHaveBeenCalled();
  });

  test('has fullscreen no matter what on mac', () => {
    mockIsOSX.mockReturnValue(true);
    mockIsFullScreenable.mockReturnValue(false);

    const menu = generateMenu(
      {
        nativefierVersion: '1.0.0',
        zoom: 1.0,
        disableDevTools: false,
      },
      window,
    );

    const editMenu = menu.filter((item) => item.label === '&View');

    const fullscreen = (
      editMenu[0].submenu as MenuItemConstructorOptions[]
    ).filter((item) => item.label === 'Toggle Full Screen');

    expect(fullscreen).toHaveLength(1);
    expect(fullscreen[0].enabled).toBe(true);
    expect(fullscreen[0].visible).toBe(true);

    expect(mockIsOSX).toHaveBeenCalled();
    expect(mockIsFullScreenable).toHaveBeenCalled();
  });

  test.each([true, false])(
    'has a fullscreen menu item that toggles fullscreen',
    (isFullScreen) => {
      mockIsOSX.mockReturnValue(false);
      mockIsFullScreenable.mockReturnValue(true);
      mockIsFullScreen.mockReturnValue(isFullScreen);

      const menu = generateMenu(
        {
          nativefierVersion: '1.0.0',
          zoom: 1.0,
          disableDevTools: false,
        },
        window,
      );

      const editMenu = menu.filter((item) => item.label === '&View');

      const fullscreen = (
        editMenu[0].submenu as MenuItemConstructorOptions[]
      ).filter((item) => item.label === 'Toggle Full Screen');

      expect(fullscreen).toHaveLength(1);
      expect(fullscreen[0].enabled).toBe(true);
      expect(fullscreen[0].visible).toBe(true);

      expect(mockIsOSX).toHaveBeenCalled();
      expect(mockIsFullScreenable).toHaveBeenCalled();

      // @ts-expect-error click is here TypeScript...
      fullscreen[0].click(null, window);

      expect(mockSetFullScreen).toHaveBeenCalledWith(!isFullScreen);
      expect(mockSetSimpleFullScreen).not.toHaveBeenCalled();
    },
  );

  test.each([true, false])(
    'has a fullscreen menu item that toggles simplefullscreen as a fallback on mac',
    (isFullScreen) => {
      mockIsOSX.mockReturnValue(true);
      mockIsFullScreenable.mockReturnValue(false);
      mockIsSimpleFullScreen.mockReturnValue(isFullScreen);

      const menu = generateMenu(
        {
          nativefierVersion: '1.0.0',
          zoom: 1.0,
          disableDevTools: false,
        },
        window,
      );

      const editMenu = menu.filter((item) => item.label === '&View');

      const fullscreen = (
        editMenu[0].submenu as MenuItemConstructorOptions[]
      ).filter((item) => item.label === 'Toggle Full Screen');

      expect(fullscreen).toHaveLength(1);
      expect(fullscreen[0].enabled).toBe(true);
      expect(fullscreen[0].visible).toBe(true);

      expect(mockIsOSX).toHaveBeenCalled();
      expect(mockIsFullScreenable).toHaveBeenCalled();

      // @ts-expect-error click is here TypeScript...
      fullscreen[0].click(null, window);

      expect(mockSetSimpleFullScreen).toHaveBeenCalledWith(!isFullScreen);
      expect(mockSetFullScreen).not.toHaveBeenCalled();
    },
  );
});
