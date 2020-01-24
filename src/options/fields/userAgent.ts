import { inferUserAgent } from '../../infer';

type UserAgentOpts = {
  userAgentString?: string;
  electronVersion?: string;
  platform?: string;
};
export async function userAgent({
  userAgentString,
  electronVersion,
  platform,
}: UserAgentOpts): Promise<string> {
  if (userAgentString) {
    return userAgentString;
  }

  return inferUserAgent(electronVersion, platform);
}
