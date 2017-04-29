import axios from 'axios';
import _ from 'lodash';
import log from 'loglevel';

const ELECTRON_VERSIONS_URL = 'https://atom.io/download/atom-shell/index.json';
const DEFAULT_CHROME_VERSION = '56.0.2924.87';

function getChromeVersionForElectronVersion(electronVersion, url = ELECTRON_VERSIONS_URL) {
  return axios.get(url, { timeout: 5000 })
    .then((response) => {
      if (response.status !== 200) {
        throw new Error(`Bad request: Status code ${response.status}`);
      }

      const data = response.data;
      const electronVersionToChromeVersion = _.zipObject(data.map(d => d.version),
                                                         data.map(d => d.chrome));

      if (!(electronVersion in electronVersionToChromeVersion)) {
        throw new Error(`Electron version '${electronVersion}' not found in retrieved version list!`);
      }

      return electronVersionToChromeVersion[electronVersion];
    });
}

export function getUserAgentString(chromeVersion, platform) {
  let userAgent;
  switch (platform) {
    case 'darwin':
      userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
      break;
    case 'win32':
      userAgent = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
      break;
    case 'linux':
      userAgent = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`;
      break;
    default:
      throw new Error('Error invalid platform specified to getUserAgentString()');
  }
  return userAgent;
}

function inferUserAgent(electronVersion, platform, url = ELECTRON_VERSIONS_URL) {
  return getChromeVersionForElectronVersion(electronVersion, url)
    .then(chromeVersion => getUserAgentString(chromeVersion, platform))
    .catch(() => {
      log.warn(`Unable to infer chrome version for user agent, using ${DEFAULT_CHROME_VERSION}`);
      return getUserAgentString(DEFAULT_CHROME_VERSION, platform);
    });
}

export default inferUserAgent;
