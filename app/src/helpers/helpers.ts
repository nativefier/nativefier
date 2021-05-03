import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { BrowserWindow } from 'electron';

const INJECT_CSS_PATH = path.join(__dirname, '..', 'inject/inject.css');

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
    if (regex.test(newUrl)) {
      return true;
    }
  }

  try {
    // Consider as "same domain-ish", without TLD/SLD list:
    // 1. app.foo.com and foo.com
    // 2. www.foo.com and foo.com
    // 3. www.foo.com and app.foo.com

    // Only use the tld and the main domain for domain-ish test
    // Enables domain-ish equality for blog.foo.com and shop.foo.com
    return domainify(currentUrl) === domainify(newUrl);
  } catch (err) {
    console.warn(
      'Failed to parse domains as determining if link is internal. From:',
      currentUrl,
      'To:',
      newUrl,
      err,
    );
    return false;
  }
}

function domainify(url: string): string {
  // So here's what we're doing here:
  // Get the hostname from the url
  const hostname = new URL(url).hostname;
  // Drop the first section if the domain
  const domain = hostname.split('.').slice(1).join('.');
  // Check the length, if it's too short, the hostname was probably the domain
  // Or if the domain doesn't have a . in it we went too far
  if (domain.length < 6 || domain.split('.').length === 0) {
    return hostname;
  }
  // This SHOULD be the domain, but nothing is 100% guaranteed
  return domain;
}

export function shouldInjectCss(): boolean {
  try {
    fs.accessSync(INJECT_CSS_PATH);
    return true;
  } catch (e) {
    return false;
  }
}

export function getCssToInject(): string {
  return fs.readFileSync(INJECT_CSS_PATH).toString();
}

/**
 * Helper to print debug messages from the main process in the browser window
 */
export function debugLog(browserWindow: BrowserWindow, message: string): void {
  // Need a delay, as it takes time for the preloaded js to be loaded by the window
  setTimeout(() => {
    browserWindow.webContents.send('debug', message);
  }, 3000);
  console.info(message);
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
