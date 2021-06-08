import * as path from 'path';
import { writeFile } from 'fs';
import { promisify } from 'util';

// @ts-expect-error No types defined until we merge https://github.com/nativefier/gitcloud-client/pull/3
import * as gitcloud from 'gitcloud';
import * as pageIcon from 'page-icon';

import {
  downloadFile,
  DownloadResult,
  getAllowedIconFormats,
  getTempDir,
} from '../helpers/helpers';
import * as log from 'loglevel';

const writeFileAsync = promisify(writeFile);

const GITCLOUD_SPACE_DELIMITER = '-';
const GITCLOUD_URL = 'https://nativefier.github.io/nativefier-icons/';

type GitCloudIcon = {
  ext: string;
  name: string;
  score: number;
  url: string;
};

function getMaxMatchScore(iconWithScores: GitCloudIcon[]): number {
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

function getMatchingIcons(
  iconsWithScores: GitCloudIcon[],
  maxScore: number,
): GitCloudIcon[] {
  return iconsWithScores
    .filter((item) => item.score === maxScore)
    .map((item) => ({ ...item, ext: path.extname(item.url) }));
}

function mapIconWithMatchScore(
  cloudIcons: GitCloudIcon[],
  targetUrl: string,
): GitCloudIcon[] {
  const normalisedTargetUrl = targetUrl.toLowerCase();
  return cloudIcons.map((item) => {
    const itemWords = item.name.split(GITCLOUD_SPACE_DELIMITER);
    const score: number = itemWords.reduce(
      (currentScore: number, word: string) => {
        if (normalisedTargetUrl.includes(word)) {
          return currentScore + 1;
        }
        return currentScore;
      },
      0,
    );

    return { ...item, score };
  });
}

async function inferIconFromStore(
  targetUrl: string,
  platform: string,
): Promise<DownloadResult | undefined> {
  log.debug(`Inferring icon from store for ${targetUrl} on ${platform}`);
  const allowedFormats = new Set(getAllowedIconFormats(platform));

  // Unsafe call until we merge https://github.com/nativefier/gitcloud-client/pull/3
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const cloudIcons: GitCloudIcon[] = (await gitcloud(
    GITCLOUD_URL,
  )) as GitCloudIcon[];
  log.debug(`Got ${cloudIcons.length} icons from gitcloud`);
  const iconWithScores = mapIconWithMatchScore(cloudIcons, targetUrl);
  const maxScore = getMaxMatchScore(iconWithScores);

  if (maxScore === 0) {
    log.debug('No relevant icon in store.');
    return undefined;
  }

  const iconsMatchingScore = getMatchingIcons(iconWithScores, maxScore);
  const iconsMatchingExt = iconsMatchingScore.filter((icon) =>
    allowedFormats.has(icon.ext),
  );
  const matchingIcon = iconsMatchingExt[0];
  const iconUrl = matchingIcon && matchingIcon.url;

  if (!iconUrl) {
    log.debug('Could not infer icon from store');
    return undefined;
  }
  return downloadFile(iconUrl);
}

export async function inferIcon(
  targetUrl: string,
  platform: string,
): Promise<string | undefined> {
  log.debug(`Inferring icon for ${targetUrl} on ${platform}`);
  const tmpDirPath = getTempDir('iconinfer');

  let icon: { ext: string; data: Buffer } | undefined =
    await inferIconFromStore(targetUrl, platform);
  if (!icon) {
    const ext = platform === 'win32' ? '.ico' : '.png';
    log.debug(`Trying to extract a ${ext} icon from the page.`);
    icon = await pageIcon(targetUrl, { ext });
  }
  if (!icon) {
    return undefined;
  }
  log.debug(`Got an icon from the page.`);

  const iconPath = path.join(tmpDirPath, `/icon${icon.ext}`);
  log.debug(
    `Writing ${(icon.data.length / 1024).toFixed(1)} kb icon to ${iconPath}`,
  );
  await writeFileAsync(iconPath, icon.data);
  return iconPath;
}
