import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { BrowserWindow } from 'electron';
import * as log from 'loglevel';

export const INJECT_DIR = path.join(__dirname, '..', 'inject');

export function isOSX(): boolean {
  return os.platform() === 'darwin';
}

export function isLinux(): boolean {
  return os.platform() === 'linux';
}

export function isWindows(): boolean {
  return os.platform() === 'win32';
}

function isInternalLoginPage(url: string): boolean {
  // Making changes? Remember to update the tests in helpers.test.ts
  const internalLoginPagesArray = [
    'amazon\\.[a-zA-Z\\.]*/[a-zA-Z\\/]*signin', // Amazon
    `facebook\\.[a-zA-Z\\.]*\\/login`, // Facebook
    'github\\.[a-zA-Z\\.]*\\/(?:login|session)', // GitHub
    'accounts\\.google\\.[a-zA-Z\\.]*', // Google
    'mail\\.google\\.[a-zA-Z\\.]*\\/accounts/SetOSID', // Google
    'linkedin\\.[a-zA-Z\\.]*/uas/login', // LinkedIn
    'login\\.live\\.[a-zA-Z\\.]*', // Microsoft
    'okta\\.[a-zA-Z\\.]*', // Okta
    'twitter\\.[a-zA-Z\\.]*/oauth/authenticate', // Twitter
    'appleid\\.apple\\.com/auth/authorize', // Apple
  ];
  const regex = RegExp(internalLoginPagesArray.join('|'));
  return regex.test(url);
}

export function linkIsInternal(
  currentUrl: string,
  newUrl: string,
  internalUrlRegex: string | RegExp,
): boolean {
  if (newUrl === 'about:blank') {
    return true;
  }

  if (isInternalLoginPage(newUrl)) {
    return true;
  }

  if (internalUrlRegex) {
    const regex = RegExp(internalUrlRegex);
    return regex.test(newUrl);
  }

  try {
    // Consider as "same domain-ish", without TLD/SLD list:
    // 1. app.foo.com and foo.com
    // 2. www.foo.com and foo.com
    // 3. www.foo.com and app.foo.com
    const currentDomain = new URL(currentUrl).hostname.replace(/^www\./, '');
    const newDomain = new URL(newUrl).hostname.replace(/^www./, '');
    const [longerDomain, shorterDomain] =
      currentDomain.length > newDomain.length
        ? [currentDomain, newDomain]
        : [newDomain, currentDomain];
    return longerDomain.endsWith(shorterDomain);
  } catch (err) {
    log.error(
      'Failed to parse domains as determining if link is internal. From:',
      currentUrl,
      'To:',
      newUrl,
      err,
    );
    return false;
  }
}

export function shouldInjectCss(): boolean {
  try {
    return fs.existsSync(INJECT_DIR);
  } catch (e) {
    return false;
  }
}

export function getCssToInject(): string {
  let cssToInject = '';
  const cssFiles = fs
    .readdirSync(INJECT_DIR, { withFileTypes: true })
    .filter(
      (injectFile) => injectFile.isFile() && injectFile.name.endsWith('.css'),
    )
    .map((cssFileStat) =>
      path.resolve(path.join(INJECT_DIR, cssFileStat.name)),
    );
  for (const cssFile of cssFiles) {
    log.debug('Injecting CSS file', cssFile);
    const cssFileData = fs.readFileSync(cssFile);
    cssToInject += `/* ${cssFile} */\n\n ${cssFileData}\n\n`;
  }
  return cssToInject;
}
/**
 * Helper to print debug messages from the main process in the browser window
 */
export function debugLog(browserWindow: BrowserWindow, message: string): void {
  // Need a delay, as it takes time for the preloaded js to be loaded by the window
  setTimeout(() => {
    browserWindow.webContents.send('debug', message);
  }, 3000);
  log.info(message);
}

export function getAppIcon(): string {
  // Prefer ICO under Windows, see
  // https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions
  // https://www.electronjs.org/docs/api/native-image#supported-formats
  if (isWindows()) {
    const ico = path.join(__dirname, '..', 'icon.ico');
    if (fs.existsSync(ico)) {
      return ico;
    }
  }
  const png = path.join(__dirname, '..', 'icon.png');
  if (fs.existsSync(png)) {
    return png;
  }
}

export function nativeTabsSupported(): boolean {
  return isOSX();
}

export function getCounterValue(title: string): string {
  const itemCountRegex = /[([{]([\d.,]*)\+?[}\])]/;
  const match = itemCountRegex.exec(title);
  return match ? match[1] : undefined;
}
