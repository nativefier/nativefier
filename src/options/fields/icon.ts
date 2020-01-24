import { inferIcon } from '../../infer';

import log = require('loglevel');

export async function icon({ icon, targetUrl, platform }): Promise<string> {
  if (icon) {
    return icon;
  }

  try {
    return await inferIcon(targetUrl, platform);
  } catch (error) {
    log.warn('Cannot automatically retrieve the app icon:', error);
    return null;
  }
}
