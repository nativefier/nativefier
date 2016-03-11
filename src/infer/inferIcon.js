import pageIcon from 'page-icon';
import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
import gitCloud from 'gitcloud';
tmp.setGracefulCleanup();

import helpers from './../helpers/helpers';
const {downloadFile} = helpers;

function inferIconFromStore(targetUrl, platform) {
    if (platform === 'win32') {
        return new Promise((resolve, reject) => reject('Skipping icon retrieval from store on windows'));
    }

    return gitCloud('http://jiahaog.com/nativefier-icons/')
        .then(fileIndex => {
            const matchingUrls = fileIndex
                .filter(item => {
                    return targetUrl
                        .toLowerCase()
                        .includes(item.name);
                })
                .map(item => item.url);

            const matchingUrl = matchingUrls[0];
            if (!matchingUrl) {
                return null;
            }
            return downloadFile(matchingUrl);
        });
}

function writeFilePromise(outPath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(outPath, data, error => {
            if (error) {
                reject(error);
                return;
            }
            resolve(outPath);
        });
    });
}

function inferFromPage(targetUrl, platform, outDir) {
    let preferredExt = 'png';
    if (platform === 'win32') {
        preferredExt = 'ico';
    }

    return pageIcon(targetUrl, {ext: preferredExt})
        .then(icon => {
            if (!icon) {
                throw 'Icon not found';
            }
            const outfilePath = path.join(outDir, `/icon.${icon.ext}`);
            return writeFilePromise(outfilePath, icon.data);
        });
}
/**
 *
 * @param {string} targetUrl
 * @param {string} platform
 * @param {string} outDir
 */
function inferIconFromUrlToPath(targetUrl, platform, outDir) {

    return inferIconFromStore(targetUrl, platform)
        .then(iconData => {

            if (!iconData) {
                throw 'Unable to find icon from store';
            }

            const outfilePath = path.join(outDir, `/icon.png`);
            return writeFilePromise(outfilePath, iconData);
        }).catch(error => {
            console.warn('Unable to find icon on store', error);
            console.warn('Falling back to inferring from url');
            return inferFromPage(targetUrl, platform, outDir);
        });
}

/**
 * @param {string} targetUrl
 * @param {string} platform
 */
function inferIcon(targetUrl, platform) {
    const tmpObj = tmp.dirSync({unsafeCleanup: true});
    const tmpPath = tmpObj.name;
    return inferIconFromUrlToPath(targetUrl, platform, tmpPath);
}

export default inferIcon;
