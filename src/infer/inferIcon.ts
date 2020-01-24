import * as path from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';

import * as gitCloud from 'gitcloud';
import * as pageIcon from 'page-icon';
import * as tmp from 'tmp';

import { downloadFile, getAllowedIconFormats } from '../helpers/helpers';

const writeFileAsync = promisify(writeFile);
tmp.setGracefulCleanup();

const GITCLOUD_SPACE_DELIMITER = '-';
const GITCLOUD_URL = 'https://jiahaog.github.io/nativefier-icons/';

function getMaxMatchScore(iconWithScores: any[]): number {
  return iconWithScores.reduce((maxScore, currentIcon) => {
    const currentScore = currentIcon.score;
    if (currentScore > maxScore) {
      return currentScore;
    }
    return maxScore;
  }, 0);
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
    const score = itemWords.reduce((currentScore, word) => {
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
  const allowedFormats = new Set(getAllowedIconFormats(platform));

  const cloudIcons = await gitCloud(GITCLOUD_URL);
  const iconWithScores = mapIconWithMatchScore(cloudIcons, targetUrl);
  const maxScore = getMaxMatchScore(iconWithScores);

  if (maxScore === 0) {
    return null;
  }

  const iconsMatchingScore = getMatchingIcons(iconWithScores, maxScore);
  const iconsMatchingExt = iconsMatchingScore.filter((icon) =>
    allowedFormats.has(icon.ext),
  );
  const matchingIcon = iconsMatchingExt[0];
  const iconUrl = matchingIcon && matchingIcon.url;

  if (!iconUrl) {
    return null;
  }
  return downloadFile(iconUrl);
}

export async function inferIcon(
  targetUrl: string,
  platform: string,
): Promise<string> {
  const tmpDirPath = tmp.dirSync().name;

  let icon: { ext: string; data: Buffer } = await inferIconFromStore(
    targetUrl,
    platform,
  );
  if (!icon) {
    const ext = platform === 'win32' ? '.ico' : '.png';
    icon = await pageIcon(targetUrl, { ext });
  }
  if (!icon) {
    return null;
  }

  const iconPath = path.join(tmpDirPath, `/icon${icon.ext}`);
  await writeFileAsync(iconPath, icon.data);
  return iconPath;
}
