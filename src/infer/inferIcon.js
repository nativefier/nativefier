import pageIcon from 'page-icon';
import path from 'path';
import fs from 'fs';
import tmp from 'tmp';
import gitCloud from 'gitcloud';
import helpers from './../helpers/helpers';

const {downloadFile, allowedIconFormats} = helpers;
tmp.setGracefulCleanup();

const GITCLOUD_SPACE_DELIMITER = '-';

function inferIconFromStore(targetUrl, platform) {
    const allowedFormats = allowedIconFormats(platform);

    return gitCloud('http://jiahaog.com/nativefier-icons/')
        .then(fileIndex => {
            const iconWithScores = mapIconWithMatchScore(fileIndex, targetUrl);
            const maxScore = getMaxMatchScore(iconWithScores);

            if (maxScore === 0) {
                return null;
            }

            const matchingIcons = getMatchingIcons(iconWithScores, maxScore);

            let matchingUrl;
            for (let format of allowedFormats) {
                for (let icon of matchingIcons) {
                    if (icon.ext !== format) {
                        continue;
                    }
                    matchingUrl = icon.url;
                }
            }

            if (!matchingUrl) {
                return null;
            }
            return downloadFile(matchingUrl);
        });
}

function mapIconWithMatchScore(fileIndex, targetUrl) {
    const normalisedTargetUrl = targetUrl.toLowerCase();
    return fileIndex
        .map(item => {
            const itemWords = item.name.split(GITCLOUD_SPACE_DELIMITER);
            const score = itemWords.reduce((currentScore, word) => {
                if (normalisedTargetUrl.includes(word)) {
                    return currentScore + 1;
                }
                return currentScore;
            }, 0);

            return Object.assign({},
                item,
                {score}
            );
        });
}

function getMaxMatchScore(iconWithScores) {
    return iconWithScores.reduce((maxScore, currentIcon) => {
        const currentScore = currentIcon.score;
        if (currentScore > maxScore) {
            return currentScore;
        }
        return maxScore;
    }, 0);
}

/**
 * also maps ext to icon object
 */
function getMatchingIcons(iconWithScores, maxScore) {
    return iconWithScores
        .filter(item => {
            return item.score === maxScore;
        })
        .map(item => {
            return Object.assign(
                {},
                item,
                {ext: path.extname(item.url)}
            );
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
    let preferredExt = '.png';
    if (platform === 'win32') {
        preferredExt = '.ico';
    }

    // todo might want to pass list of preferences instead
    return pageIcon(targetUrl, {ext: preferredExt})
        .then(icon => {
            if (!icon) {
                return null;
            }

            const outfilePath = path.join(outDir, `/icon${icon.ext}`);
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
        .then(icon => {
            if (!icon) {
                return inferFromPage(targetUrl, platform, outDir);
            }

            const outfilePath = path.join(outDir, `/icon${icon.ext}`);
            return writeFilePromise(outfilePath, icon.data);
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
