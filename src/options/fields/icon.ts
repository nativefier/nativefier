import * as log from 'loglevel';

import { inferIcon } from '../../infer/inferIcon';

type IconParams = {
  packager: {
    icon?: string;
    targetUrl: string;
    platform?: string;
  };
};

export async function icon(options: IconParams): Promise<string> {
  if (options.packager.icon) {
    log.debug('Got icon from options. Using it, no inferring needed');
    return null;
  }

  try {
    return await inferIcon(
      options.packager.targetUrl,
      options.packager.platform,
    );
  } catch (error) {
    log.warn(
      'Cannot automatically retrieve the app icon:',
      error.message || '',
    );
    return null;
  }
}
