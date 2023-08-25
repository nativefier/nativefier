import { CreateOptions } from '@electron/asar';
import { randomUUID } from 'crypto';
import * as electronPackager from 'electron-packager';

export type TitleBarValue =
  | 'default'
  | 'hidden'
  | 'hiddenInset'
  | 'customButtonsOnHover';
export type TrayValue = 'true' | 'false' | 'start-in-tray';

export interface ElectronPackagerOptions extends electronPackager.Options {
  arch: string;
  portable: boolean;
  platform?: string;
  targetUrl: string;
  upgrade: boolean;
  upgradeFrom?: string;
}

export interface AppOptions {
  packager: ElectronPackagerOptions;
  nativefier: {
    accessibilityPrompt: boolean;
    alwaysOnTop: boolean;
    backgroundColor?: string;
    basicAuthPassword?: string;
    basicAuthUsername?: string;
    blockExternalUrls: boolean;
    bookmarksMenu?: string;
    bounce: boolean;
    browserwindowOptions?: BrowserWindowOptions;
    clearCache: boolean;
    counter: boolean;
    crashReporter?: string;
    disableContextMenu: boolean;
    disableDevTools: boolean;
    disableGpu: boolean;
    disableOldBuildWarning: boolean;
    diskCacheSize?: number;
    electronVersionUsed?: string;
    enableEs3Apis: boolean;
    fastQuit: boolean;
    fileDownloadOptions?: Record<string, unknown>;
    flashPluginDir?: string;
    fullScreen: boolean;
    globalShortcuts?: GlobalShortcut[];
    hideWindowFrame: boolean;
    ignoreCertificate: boolean;
    ignoreGpuBlacklist: boolean;
    inject?: string[];
    insecure: boolean;
    internalUrls?: string;
    lang?: string;
    maximize: boolean;
    nativefierVersion: string;
    processEnvs?: string;
    proxyRules?: string;
    quiet?: boolean;
    showMenuBar: boolean;
    singleInstance: boolean;
    strictInternalUrls: boolean;
    titleBarStyle?: TitleBarValue;
    tray: TrayValue;
    userAgent?: string;
    userAgentHonest: boolean;
    verbose: boolean;
    versionString?: string;
    width?: number;
    widevine: boolean;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    x?: number;
    y?: number;
    zoom: number;
  };
}

export type BrowserWindowOptions = Record<string, unknown> & {
  webPreferences?: Record<string, unknown>;
};

export type GlobalShortcut = {
  key: string;
  inputEvents: {
    type:
      | 'mouseDown'
      | 'mouseUp'
      | 'mouseEnter'
      | 'mouseLeave'
      | 'contextMenu'
      | 'mouseWheel'
      | 'mouseMove'
      | 'keyDown'
      | 'keyUp'
      | 'char';
    keyCode: string;
  }[];
};

export type NativefierOptions = Partial<
  AppOptions['packager'] & AppOptions['nativefier']
>;

export type OutputOptions = NativefierOptions & {
  blockExternalUrls: boolean;
  browserwindowOptions?: BrowserWindowOptions;
  buildDate: number;
  companyName?: string;
  disableDevTools: boolean;
  fileDownloadOptions?: Record<string, unknown>;
  internalUrls: string | RegExp | undefined;
  isUpgrade: boolean;
  name: string;
  nativefierVersion: string;
  oldBuildWarningText: string;
  strictInternalUrls: boolean;
  tabbingIdentifier?: string;
  targetUrl: string;
  userAgent?: string;
  zoom?: number;
};

export type PackageJSON = {
  name: string;
};

export type RawOptions = {
  accessibilityPrompt?: boolean;
  alwaysOnTop?: boolean;
  appCopyright?: string;
  appVersion?: string;
  arch?: string;
  asar?: boolean | CreateOptions;
  backgroundColor?: string;
  basicAuthPassword?: string;
  basicAuthUsername?: string;
  blockExternalUrls?: boolean;
  bookmarksMenu?: string;
  bounce?: boolean;
  browserwindowOptions?: BrowserWindowOptions;
  buildVersion?: string;
  clearCache?: boolean;
  conceal?: boolean;
  counter?: boolean;
  crashReporter?: string;
  darwinDarkModeSupport?: boolean;
  disableContextMenu?: boolean;
  disableDevTools?: boolean;
  disableGpu?: boolean;
  disableOldBuildWarning?: boolean;
  disableOldBuildWarningYesiknowitisinsecure?: boolean;
  diskCacheSize?: number;
  electronVersion?: string;
  electronVersionUsed?: string;
  enableEs3Apis?: boolean;
  fastQuit?: boolean;
  fileDownloadOptions?: Record<string, unknown>;
  flashPath?: string;
  flashPluginDir?: string;
  fullScreen?: boolean;
  globalShortcuts?: string | GlobalShortcut[];
  height?: number;
  hideWindowFrame?: boolean;
  icon?: string;
  ignoreCertificate?: boolean;
  ignoreGpuBlacklist?: boolean;
  inject?: string[];
  insecure?: boolean;
  internalUrls?: string;
  lang?: string;
  maxHeight?: number;
  maximize?: boolean;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
  name?: string;
  nativefierVersion?: string;
  out?: string;
  overwrite?: boolean;
  platform?: string;
  portable?: boolean;
  processEnvs?: string;
  proxyRules?: string;
  quiet?: boolean;
  showMenuBar?: boolean;
  singleInstance?: boolean;
  strictInternalUrls?: boolean;
  targetUrl?: string;
  titleBarStyle?: TitleBarValue;
  tray?: TrayValue;
  upgrade?: string | boolean;
  upgradeFrom?: string;
  userAgent?: string;
  userAgentHonest?: boolean;
  verbose?: boolean;
  versionString?: string;
  widevine?: boolean;
  width?: number;
  win32metadata?: electronPackager.Win32MetadataOptions;
  x?: number;
  y?: number;
  zoom?: number;
};

export type WindowOptions = {
  autoHideMenuBar: boolean;
  blockExternalUrls: boolean;
  browserwindowOptions?: BrowserWindowOptions;
  insecure: boolean;
  internalUrls?: string | RegExp;
  strictInternalUrls?: boolean;
  name: string;
  proxyRules?: string;
  show?: boolean;
  tabbingIdentifier?: string;
  targetUrl: string;
  userAgent?: string;
  zoom: number;
};

export function outputOptionsToWindowOptions(
  options: OutputOptions,
  generateTabbingIdentifierIfMissing: boolean,
): WindowOptions {
  return {
    ...options,
    autoHideMenuBar: !options.showMenuBar,
    insecure: options.insecure ?? false,
    tabbingIdentifier: generateTabbingIdentifierIfMissing
      ? options.tabbingIdentifier ?? randomUUID()
      : options.tabbingIdentifier,
    zoom: options.zoom ?? 1.0,
  };
}
