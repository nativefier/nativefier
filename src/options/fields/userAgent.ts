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

export async function userAgent(options: UserAgentOpts): Promise<string> {
  if (options.nativefier.userAgent) {
    return null;
  }

  return inferUserAgent(
    options.packager.electronVersion,
    options.packager.platform,
  );
}
