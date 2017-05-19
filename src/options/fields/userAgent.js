import { inferUserAgent } from './../../infer';

export default function ({ userAgent, electronVersion, platform }) {
  if (userAgent) {
    return Promise.resolve(userAgent);
  }

  return inferUserAgent(electronVersion, platform);
}
