import log from 'loglevel';
import { inferIcon } from './../../infer';

export default function ({ icon, targetUrl, platform }) {
  // Icon is the path to the icon
  if (icon) {
    return Promise.resolve(icon);
  }

  return inferIcon(targetUrl, platform)
    .catch((error) => {
      log.warn('Cannot automatically retrieve the app icon:', error);
      return null;
    });
}
