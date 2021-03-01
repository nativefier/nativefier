import axios from 'axios';
import * as log from 'loglevel';
import { DEFAULT_CHROME_VERSION } from '../constants';

const ELECTRON_VERSIONS_URL = 'https://atom.io/download/atom-shell/index.json';

type ElectronRelease = {
  version: string;
  date: string;
  node: string;
  v8: string;
  uv: string;
  zlib: string;
  openssl: string;
  modules: string;
  chrome: string;
  files: string[];
};

async function getChromeVersionForElectronVersion(
  electronVersion: string,
  url = ELECTRON_VERSIONS_URL,
): Promise<string> {
  log.debug('Grabbing electron<->chrome versions file from', url);
  const response = await axios.get(url, { timeout: 5000 });
  if (response.status !== 200) {
    throw new Error(`Bad request: Status code ${response.status}`);
  }
  const electronReleases: ElectronRelease[] = response.data;
  const electronVersionToChromeVersion: { [key: string]: string } = {};
  for (const release of electronReleases) {
    electronVersionToChromeVersion[release.version] = release.chrome;
  }
  if (!(electronVersion in electronVersionToChromeVersion)) {
    throw new Error(
      `Electron version '${electronVersion}' not found in retrieved version list!`,
    );
  }
  const chromeVersion = electronVersionToChromeVersion[electronVersion];
  log.debug(
    `Associated electron v${electronVersion} to chrome v${chromeVersion}`,
  );
  return chromeVersion;
}

export function getUserAgentString(
  chromeVersion: string,
  platform: string,
): string {
  let userAgent: string;
  switch (platform) {
    case 'darwin':
    case 'mas':
      userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
      break;
    case 'win32':
      userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
      break;
    case 'linux':
      userAgent = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
      break;
    default:
      throw new Error(
        'Error invalid platform specified to getUserAgentString()',
      );
  }
  log.debug(
    `Given chrome ${chromeVersion} on ${platform},`,
    `using user agent: ${userAgent}`,
  );
  return userAgent;
}

export async function inferUserAgent(
  electronVersion: string,
  platform: string,
  url = ELECTRON_VERSIONS_URL,
): Promise<string> {
  log.debug(
    `Inferring user agent for electron ${electronVersion} / ${platform}`,
  );
  try {
    const chromeVersion = await getChromeVersionForElectronVersion(
      electronVersion,
      url,
    );
    return getUserAgentString(chromeVersion, platform);
  } catch (e) {
    log.warn(
      `Unable to infer chrome version for user agent, using ${DEFAULT_CHROME_VERSION}`,
    );
    return getUserAgentString(DEFAULT_CHROME_VERSION, platform);
  }
}
