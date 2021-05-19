import * as log from 'loglevel';

import { getChromeVersionForElectronVersion } from '../../infer/browsers/inferChromeVersion';
import { getLatestFirefoxVersion } from '../../infer/browsers/inferFirefoxVersion';
import { getLatestSafariVersion } from '../../infer/browsers/inferSafariVersion';
import { normalizePlatform } from '../optionsMain';

type UserAgentOpts = {
  packager: {
    electronVersion?: string;
    platform?: string;
  };
  nativefier: {
    userAgent?: string;
  };
};

const USER_AGENT_PLATFORM_MAPS = {
  darwin: 'Macintosh; Intel Mac OS X 10_15_7',
  linux: 'X11; Linux x86_64',
  win32: 'Windows NT 10.0; Win64; x64',
};

const USER_AGENT_SHORT_CODE_MAPS = {
  edge: edgeUserAgent,
  firefox: firefoxUserAgent,
  safari: safariUserAgent,
};

export async function userAgent(options: UserAgentOpts): Promise<string> {
  if (!options.nativefier.userAgent) {
    // No user agent got passed. Let's handle it with the app.userAgentFallback
    return null;
  }

  if (
    !Object.keys(USER_AGENT_SHORT_CODE_MAPS).includes(
      options.nativefier.userAgent.toLowerCase(),
    )
  ) {
    // Real user agent got passed. No need to translate it.
    log.debug(
      `${options.nativefier.userAgent.toLowerCase()} not found in`,
      Object.keys(USER_AGENT_SHORT_CODE_MAPS),
    );
    return null;
  }
  options.packager.platform = normalizePlatform(options.packager.platform);

  const userAgentPlatform =
    USER_AGENT_PLATFORM_MAPS[
      options.packager.platform === 'mas' ? 'darwin' : options.packager.platform
    ];

  const mapFunction = USER_AGENT_SHORT_CODE_MAPS[options.nativefier.userAgent];

  return await mapFunction(userAgentPlatform, options.packager.electronVersion);
}

async function edgeUserAgent(
  platform: string,
  electronVersion: string,
): Promise<string> {
  const chromeVersion = await getChromeVersionForElectronVersion(
    electronVersion,
  );

  return `Mozilla/5.0 (${platform}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36 Edg/${chromeVersion}`;
}

async function firefoxUserAgent(platform: string): Promise<string> {
  const firefoxVersion = await getLatestFirefoxVersion();

  return `Mozilla/5.0 (${platform}; rv:${firefoxVersion}) Gecko/20100101 Firefox/${firefoxVersion}`;
}

async function safariUserAgent(platform: string): Promise<string> {
  const safariVersion = await getLatestSafariVersion();

  return `Mozilla/5.0 (${platform}) AppleWebKit/${safariVersion.webkitVersion} (KHTML, like Gecko) Version/${safariVersion.version} Safari/${safariVersion.webkitVersion}`;
}
