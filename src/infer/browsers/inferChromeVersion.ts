import axios from 'axios';
import * as log from 'loglevel';
import {
  DEFAULT_CHROME_VERSION,
  DEFAULT_ELECTRON_VERSION,
} from '../../constants';

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

const ELECTRON_VERSIONS_URL = 'https://releases.electronjs.org/releases.json';

export async function getChromeVersionForElectronVersion(
  electronVersion: string,
  url = ELECTRON_VERSIONS_URL,
): Promise<string> {
  if (!electronVersion || electronVersion === DEFAULT_ELECTRON_VERSION) {
    // Exit quickly for the scenario that we already know about
    return DEFAULT_CHROME_VERSION;
  }

  try {
    log.debug('Grabbing electron<->chrome versions file from', url);
    const response = await axios.get<ElectronRelease[]>(url, { timeout: 5000 });
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
  } catch (err: unknown) {
    log.error('getChromeVersionForElectronVersion ERROR', err);
    log.debug('Falling back to default Chrome version', DEFAULT_CHROME_VERSION);
    return DEFAULT_CHROME_VERSION;
  }
}
