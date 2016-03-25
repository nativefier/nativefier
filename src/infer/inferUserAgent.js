import request from 'request';
import _ from 'lodash';

const ELECTRON_VERSIONS_URL = 'https://atom.io/download/atom-shell/index.json';

function getChromeVersionForElectronVersion(electronVersion, url = ELECTRON_VERSIONS_URL) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }
            if (response.statusCode === 200) {
                const data = JSON.parse(body);
                const electronVersionToChromeVersion = _.zipObject(data.map(d => d.version), data.map(d => d.chrome));
                if (!(electronVersion in electronVersionToChromeVersion)) {
                    reject(`Electron version '${ electronVersion }' not found in retrieved version list!`);
                    return;
                }
                resolve(electronVersionToChromeVersion[electronVersion]);
                return;
            }
            reject('Bad request: ' + response.statusCode);
            return;
        });
    });
}

export function getUserAgentString(chromeVersion, platform) {
    let userAgent;
    switch (platform) {
        case 'darwin':
            userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ chromeVersion } Safari/537.36`;
            break;
        case 'win32':
            userAgent = `Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ chromeVersion } Safari/537.36`;
            break;
        case 'linux':
            userAgent = `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ chromeVersion } Safari/537.36`;
            break;
        default:
            throw 'Error invalid platform specified to getUserAgentString()';
    }
    return userAgent;
}

export function inferUserAgent(electronVersion, platform) {
    return getChromeVersionForElectronVersion(electronVersion)
        .then(chromeVersion => {
            return getUserAgentString(chromeVersion, platform);
        });
}
