import * as path from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';

import * as gitCloud from 'gitcloud';
import * as pageIcon from 'page-icon';

import {
  downloadFile,
  getAllowedIconFormats,
  getTempDir,
} from '../helpers/helpers';
import * as log from 'loglevel';

const writeFileAsync = promisify(writeFile);

const GITCLOUD_SPACE_DELIMITER = '-';
const GITCLOUD_URL = 'https://nativefier.github.io/nativefier-icons/';

function getMaxMatchScore(iconWithScores: any[]): number {
  const score = iconWithScores.reduce((maxScore, currentIcon) => {
    const currentScore = currentIcon.score;
    if (currentScore > maxScore) {
      return currentScore;
    }
    return maxScore;
  }, 0);
  log.debug('Max icon match score:', score);
  return score;
}

function getMatchingIcons(iconsWithScores: any[], maxScore: number): any[] {
  return iconsWithScores
    .filter((item) => item.score === maxScore)
    .map((item) => ({ ...item, ext: path.extname(item.url) }));
}

function mapIconWithMatchScore(cloudIcons: any[], targetUrl: string): any {
  const normalisedTargetUrl = targetUrl.toLowerCase();
  return cloudIcons.map((item) => {
    const itemWords = item.name.split(GITCLOUD_SPACE_DELIMITER);
    const score = itemWords.reduce((currentScore: number, word: string) => {
      if (normalisedTargetUrl.includes(word)) {
        return currentScore + 1;
      }
      return currentScore;
    }, 0);

    return { ...item, score };
  });
}

async function inferIconFromStore(
  targetUrl: string,
  platform: string,
): Promise<any> {
  log.debug(`Inferring icon from store for ${targetUrl} on ${platform}`);
  const allowedFormats = new Set(getAllowedIconFormats(platform));

  const cloudIcons: any[] = await gitCloud(GITCLOUD_URL);
  log.debug(`Got ${cloudIcons.length} icons from gitcloud`);
  const iconWithScores = mapIconWithMatchScore(cloudIcons, targetUrl);
  const maxScore = getMaxMatchScore(iconWithScores);

  if (maxScore === 0) {
    log.debug('No relevant icon in store.');
    return null;
  }

  const iconsMatchingScore = getMatchingIcons(iconWithScores, maxScore);
  const iconsMatchingExt = iconsMatchingScore.filter((icon) =>
    allowedFormats.has(icon.ext),
  );
  const matchingIcon = iconsMatchingExt[0];
  const iconUrl = matchingIcon && matchingIcon.url;

  if (!iconUrl) {
    log.debug('Could not infer icon from store');
    return null;
  }
  return downloadFile(iconUrl);
}

export async function inferIcon(
  targetUrl: string,
  platform: string,
): Promise<string> {
  log.debug(`Inferring icon for ${targetUrl} on ${platform}`);
  const tmpDirPath = getTempDir('iconinfer');

  let icon: { ext: string; data: Buffer } = await inferIconFromStore(
    targetUrl,
    platform,
  );
  if (!icon) {
    const ext = platform === 'win32' ? '.ico' : '.png';
    log.debug(`Trying to extract a ${ext} icon from the page.`);
    icon = await pageIcon(targetUrl, { ext });
  }
  if (!icon) {
    return null;
  }
  log.debug(`Got an icon from the page.`);

  const iconPath = path.join(tmpDirPath, `/icon${icon.ext}`);
  log.debug(
    `Writing ${(icon.data.length / 1024).toFixed(1)} kb icon to ${iconPath}`,
  );
  await writeFileAsync(iconPath, icon.data);
  return iconPath;
}
