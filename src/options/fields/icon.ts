import * as log from 'loglevel';

import { inferIcon } from '../../infer/inferIcon';

type IconParamsProvided = {
  icon: string;
};

type IconParamsNeedsInfer = {
  targetUrl: string;
  platform: string;
};

type IconParams = IconParamsProvided | IconParamsNeedsInfer;

export async function icon(params: IconParams): Promise<string> {
  if ('icon' in params) {
    log.debug('Got icon from options. Using it, no inferring needed');
    return params.icon;
  }

  try {
    return await inferIcon(params.targetUrl, params.platform);
  } catch (error) {
    log.warn('Cannot automatically retrieve the app icon:', error);
    return null;
  }
}
