import * as log from 'loglevel';

import { inferIcon } from '../../infer/inferIcon';

type IconParams = {
  packager: {
    icon?: string;
    targetUrl: string;
    platform?: string;
  };
};

export async function icon(options: IconParams): Promise<void> {
  if (options.packager.icon) {
    log.debug('Got icon from options. Using it, no inferring needed');
    return;
  }

  try {
    options.packager.icon = await inferIcon(
      options.packager.targetUrl,
      options.packager.platform,
    );
  } catch (error) {
    log.warn('Cannot automatically retrieve the app icon:', error);
    return null;
  }
}
