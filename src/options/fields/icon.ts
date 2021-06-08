import * as log from 'loglevel';

import { inferIcon } from '../../infer/inferIcon';

type IconParams = {
  packager: {
    icon?: string;
    targetUrl: string;
    platform?: string;
  };
};

export async function icon(options: IconParams): Promise<string | undefined> {
  if (options.packager.icon) {
    log.debug('Got icon from options. Using it, no inferring needed');
    return undefined;
  }

  if (!options.packager.platform) {
    log.error('No platform specified. Icon can not be inferrerd.');
    return undefined;
  }

  try {
    return await inferIcon(
      options.packager.targetUrl,
      options.packager.platform,
    );
  } catch (err: unknown) {
    log.warn('Cannot automatically retrieve the app icon:', err);
    return undefined;
  }
}
