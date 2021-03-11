import * as electronPackager from 'electron-packager';

export interface ElectronPackagerOptions extends electronPackager.Options {
  targetUrl: string;
  platform: string;
}

export interface AppOptions {
  packager: ElectronPackagerOptions;
  nativefier: {
    accessibilityPrompt: boolean;
    alwaysOnTop: boolean;
    backgroundColor: string;
    basicAuthPassword: string;
    basicAuthUsername: string;
    bounce: boolean;
    browserwindowOptions: any;
    clearCache: boolean;
    counter: boolean;
    crashReporter: string;
    disableContextMenu: boolean;
    disableDevTools: boolean;
    disableGpu: boolean;
    disableOldBuildWarning: boolean;
    diskCacheSize: number;
    enableEs3Apis: boolean;
    fastQuit: boolean;
    fileDownloadOptions: any;
    flashPluginDir: string;
    fullScreen: boolean;
    globalShortcuts: any;
    hideWindowFrame: boolean;
    ignoreCertificate: boolean;
    ignoreGpuBlacklist: boolean;
    inject: string[];
    insecure: boolean;
    internalUrls: string;
    blockExternalUrls: boolean;
    maximize: boolean;
    nativefierVersion: string;
    processEnvs: string;
    proxyRules: string;
    showMenuBar: boolean;
    singleInstance: boolean;
    titleBarStyle: string;
    tray: string | boolean;
    userAgent: string;
    verbose: boolean;
    versionString: string;
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    x: number;
    y: number;
    zoom: number;
  };
}

export type NativefierOptions = Partial<
  AppOptions['packager'] & AppOptions['nativefier']
>;
