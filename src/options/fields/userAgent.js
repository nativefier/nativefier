import { inferUserAgent } from './../../infer';

export default function ({ userAgent, electronVersion, platform }) {
  if (userAgent) {
    return userAgent;
  }

  return inferUserAgent(electronVersion, platform);
}
