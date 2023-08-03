import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { BrowserWindow, OpenExternalOptions, shell } from 'electron';

import * as log from '../helpers/loggingHelper';
import { showNavigationBlockedMessage } from './windowHelpers';

export const INJECT_DIR = path.join(__dirname, '..', 'inject');

/**
 * Firefox's list of protocols for which opening an external handler is allowed without confirmation.
 * Taken from Firefox's. Location might vary in codebase, search for one of them, e.g.
 * https://searchfox.org/mozilla-central/search?q=%22xmpp%22&path=&case=false&regexp=false
 */
const URL_PROTOCOLS_NOCONFIRMATION_FIREFOX = [
  'bitcoin:',
  'ftp:',
  'ftps:',
  'geo:',
  'im:',
  'irc:',
  'ircs:',
  'magnet:',
  'mailto:',
  'matrix:',
  'mms:',
  'news:',
  'nntp:',
  'openpgp4fpr:',
  'sftp:',
  'sip:',
  'sms:',
  'smsto:',
  'ssh:',
  'tel:',
  'urn:',
  'webcal:',
  'wtai:',
  'xmpp:',
];
/**
 * Our extension to Firefox's list. If extending this list too much, we should
 * really add a confirmation modal (for now we just block), like browsers do.
 * But for now, since nobody shouts at us for bluntly blocking anything else,
 * let's keep rolling with it.
 */
const URL_PROTOCOLS_NOCONFIRMATION_EXTRA = ['zoommtg:'];
/**
 * List of protocols for which opening an external handler is allowed without confirmation.
 * Note: "without confirmation" is currently a lie. It was implemented this way
 * as a way to know from user feedback what protocols would cause users to shout,
 * but there wasn't much shouting happening, so we currently don't have a confirmation
 * mechanism, we just bluntly block. That might need to change at some point.
 */
const URL_PROTOCOLS_NOCONFIRMATION = [
  'http:',
  'https:',
  ...URL_PROTOCOLS_NOCONFIRMATION_FIREFOX,
  ...URL_PROTOCOLS_NOCONFIRMATION_EXTRA,
];
const SHELL_SAFETY_FEEDBACK_STR =
  'If you believe this URL should open, you might be right, and our validation might be excessive.' +
  'Please share this error & URL at https://github.com/nativefier/nativefier/issues/1459';

export function isUrlShellSafe(
  urlToGo: string,
): { blocked: false } | { blocked: true; reason: string } {
  let url: URL;
  try {
    url = new URL(urlToGo.toLowerCase());
  } catch (err: unknown) {
    return {
      blocked: true,
      reason: `URL appears malformed. ${SHELL_SAFETY_FEEDBACK_STR}`,
    };
  }

  if (!URL_PROTOCOLS_NOCONFIRMATION.includes(url.protocol)) {
    return {
      blocked: true,
      reason: `URL protocol is disallowed. ${SHELL_SAFETY_FEEDBACK_STR}`,
    };
  }

  // https://cwe.mitre.org/data/definitions/177.html
  if (
    urlToGo.includes('%00') ||
    urlToGo.includes('%0a') ||
    urlToGo.includes('%2e') ||
    urlToGo.includes('%2f') ||
    urlToGo.includes('%5c')
  ) {
    return {
      blocked: true,
      reason: `URL might be malicious. ${SHELL_SAFETY_FEEDBACK_STR}`,
    };
  }

  return { blocked: false };
}

/**
 * Helper to print debug messages from the main process in the browser window
 */
export function debugLog(browserWindow: BrowserWindow, message: string): void {
  // Need a delay, as it takes time for the preloaded js to be loaded by the window
  setTimeout(() => {
    browserWindow.webContents.send('debug', message);
  }, 3000);
  log.debug(message);
}

/**
 * Helper to determine domain-ish equality for many cases, the trivial ones
 * and the trickier ones, e.g. `blog.foo.com` and `shop.foo.com`,
 * in a way that is "good enough", and doesn't need a list of SLDs.
 * See chat at https://github.com/nativefier/nativefier/pull/1171#pullrequestreview-649132523
 */
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

export function getAppIcon(): string | undefined {
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

export function getCounterValue(title: string): string | undefined {
  const itemCountRegex = /[([{]([\d.,:]*)\+?[}\])]/;
  const match = itemCountRegex.exec(title);
  return match ? match[1] : undefined;
}

export function getCSSToInject(): string {
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
    cssToInject += `/* ${cssFile} */\n\n ${cssFileData.toString()}\n\n`;
  }
  return cssToInject;
}

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
  // Making changes? Remember to update the tests in helpers.test.ts and in API.md
  const internalLoginPagesArray = [
    'amazon\\.[a-zA-Z\\.]*/[a-zA-Z\\/]*signin', // Amazon
    `facebook\\.[a-zA-Z\\.]*\\/login`, // Facebook
    'github\\.[a-zA-Z\\.]*\\/(?:login|session)', // GitHub
    'accounts\\.google\\.[a-zA-Z\\.]*', // Google
    'mail\\.google\\.[a-zA-Z\\.]*\\/accounts/SetOSID', // Google
    'linkedin\\.[a-zA-Z\\.]*/uas/login', // LinkedIn
    'login\\.live\\.[a-zA-Z\\.]*', // Microsoft
    'login\\.microsoftonline\\.[a-zA-Z\\.]*', // Microsoft
    'okta\\.[a-zA-Z\\.]*', // Okta
    'twitter\\.[a-zA-Z\\.]*/oauth/authenticate', // Twitter
    'appleid\\.apple\\.com/auth/authorize', // Apple
    '(?:id|auth)\\.atlassian\\.[a-zA-Z]+', // Atlassian
    '.*\\.workspaceair\\.com', // VMWare Workspace One SSO
    '.*\\.securid\\.com', // SecurID for VMWare Workspace One SSO
  ];
  // Making changes? Remember to update the tests in helpers.test.ts and in API.md
  const regex = RegExp(internalLoginPagesArray.join('|'));
  return regex.test(url);
}

export function linkIsInternal(
  currentUrl: string,
  newUrl: string,
  internalUrlRegex: string | RegExp | undefined,
  isStrictInternalUrlsEnabled: boolean | undefined,
): boolean {
  log.debug('linkIsInternal', { currentUrl, newUrl, internalUrlRegex });
  if (newUrl.split('#')[0] === 'about:blank') {
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

  if (isStrictInternalUrlsEnabled) {
    return currentUrl == newUrl;
  }

  try {
    // Consider as "same domain-ish", without TLD/SLD list:
    // 1. app.foo.com and foo.com
    // 2. www.foo.com and foo.com
    // 3. www.foo.com and app.foo.com

    // Only use the tld and the main domain for domain-ish test
    // Enables domain-ish equality for blog.foo.com and shop.foo.com
    return domainify(currentUrl) === domainify(newUrl);
  } catch (err: unknown) {
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

export function nativeTabsSupported(): boolean {
  return isOSX();
}

/**
 * Open the given external protocol URL in the desktop's default manner
 * (e.g. `mailto:` URLs in the user's default mail agent), with extra validation.
 */
export function openExternal(
  url: string,
  options?: OpenExternalOptions,
): Promise<void> {
  const urlShellSafety = isUrlShellSafe(url);
  log.debug('openExternal', { url, options, urlShellSafety });
  if (urlShellSafety.blocked) {
    return new Promise((resolve) => {
      showNavigationBlockedMessage(
        `Navigation blocked to ${url}\n\n${urlShellSafety.reason}`,
      )
        .then(() => resolve())
        .catch((err: unknown) => {
          throw err;
        });
    });
  }

  return shell.openExternal(url, options);
}

// Copy-pastaed as unable to get imports to work in preload.
// If modifying, update also app/src/preload.ts
export function isWayland(): boolean {
  return (
    isLinux() &&
    (Boolean(process.env.WAYLAND_DISPLAY) ||
      process.env.XDG_SESSION_TYPE === 'wayland')
  );
}

export function removeUserAgentSpecifics(
  userAgentFallback: string,
  appName: string,
  appVersion: string,
): string {
  // Electron userAgentFallback is the user agent used if none is specified when creating a window.
  // For our purposes, it's useful because its format is similar enough to a real Chrome's user agent to not need
  // to infer the userAgent. userAgentFallback normally looks like this:
  // Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) app-nativefier-804458/1.0.0 Chrome/89.0.4389.128 Electron/12.0.7 Safari/537.36
  // We just need to strip out the appName/1.0.0 and Electron/electronVersion
  return userAgentFallback
    .replace(`Electron/${process.versions.electron} `, '')
    .replace(`${appName}/${appVersion} `, '');
}

/** Removes extra spaces from a text */
export function cleanupPlainText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}
