import { AppOptions } from '../../../shared/src/options/model';
import { processOptions } from './fields';
describe('fields', () => {
  let options: AppOptions;

  beforeEach(() => {
    options = {
      nativefier: {
        accessibilityPrompt: false,
        alwaysOnTop: false,
        backgroundColor: undefined,
        basicAuthPassword: undefined,
        basicAuthUsername: undefined,
        blockExternalUrls: false,
        bookmarksMenu: undefined,
        bounce: false,
        browserwindowOptions: undefined,
        clearCache: false,
        counter: false,
        crashReporter: undefined,
        disableContextMenu: false,
        disableDevTools: false,
        disableGpu: false,
        disableOldBuildWarning: false,
        diskCacheSize: undefined,
        enableEs3Apis: false,
        fastQuit: true,
        fileDownloadOptions: undefined,
        flashPluginDir: undefined,
        fullScreen: false,
        globalShortcuts: undefined,
        height: undefined,
        hideWindowFrame: false,
        ignoreCertificate: false,
        ignoreGpuBlacklist: false,
        inject: [],
        insecure: false,
        internalUrls: undefined,
        maximize: false,
        maxHeight: undefined,
        minWidth: undefined,
        minHeight: undefined,
        maxWidth: undefined,
        nativefierVersion: '1.0.0',
        processEnvs: undefined,
        proxyRules: undefined,
        showMenuBar: false,
        singleInstance: false,
        strictInternalUrls: false,
        titleBarStyle: undefined,
        tray: 'false',
        userAgent: undefined,
        userAgentHonest: false,
        verbose: false,
        versionString: '1.0.0',
        width: undefined,
        widevine: false,
        x: undefined,
        y: undefined,
        zoom: 1,
      },
      packager: {
        arch: process.arch,
        dir: '',
        platform: process.platform,
        portable: false,
        targetUrl: '',
        upgrade: false,
      },
    };
  });

  test('fully-defined async options are returned as-is', async () => {
    options.packager.icon = '/my/icon.png';
    options.packager.name = 'my beautiful app ';
    options.packager.platform = 'darwin';
    options.nativefier.userAgent = 'random user agent';
    await processOptions(options);

    expect(options.packager.icon).toEqual('/my/icon.png');
    expect(options.packager.name).toEqual('my beautiful app');
    expect(options.nativefier.userAgent).toEqual('random user agent');
  });

  test('name has spaces stripped in linux', async () => {
    options.packager.name = 'my beautiful app ';
    options.packager.platform = 'linux';
    await processOptions(options);

    expect(options.packager.name).toEqual('mybeautifulapp');
  });

  test('user agent is ignored if not provided', async () => {
    await processOptions(options);

    expect(options.nativefier.userAgent).toBeUndefined();
  });

  test('user agent short code is populated', async () => {
    options.nativefier.userAgent = 'edge';
    await processOptions(options);

    expect(options.nativefier.userAgent).not.toBe('edge');
  });
});
