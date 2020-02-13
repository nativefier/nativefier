import { inferUserAgent } from '../../infer/inferUserAgent';

type UserAgentOpts = {
  packager: {
    electronVersion?: string;
    platform?: string;
  };
  nativefier: {
    userAgent?: string;
  };
};

export async function userAgent(options: UserAgentOpts): Promise<void> {
  if (options.nativefier.userAgent) {
    return;
  }

  options.nativefier.userAgent = await inferUserAgent(
    options.packager.electronVersion,
    options.packager.platform,
  );
}
