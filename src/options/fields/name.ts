import * as log from 'loglevel';

import { sanitizeFilename } from '../../utils/sanitizeFilename';
import { inferTitle } from '../../infer/inferTitle';
import { DEFAULT_APP_NAME } from '../../constants';

type NameParams = {
  packager: {
    name?: string;
    platform?: string;
    targetUrl: string;
  };
};

async function tryToInferName(targetUrl: string): Promise<string> {
  try {
    log.debug('Inferring name for', targetUrl);
    const pageTitle = await inferTitle(targetUrl);
    return pageTitle || DEFAULT_APP_NAME;
  } catch (err) {
    log.warn(
      `Unable to automatically determine app name, falling back to '${DEFAULT_APP_NAME}'. Reason: ${(err as Error).toString()}`,
    );
    return DEFAULT_APP_NAME;
  }
}

export async function name(options: NameParams): Promise<string> {
  if (options.packager.name) {
    log.debug(
      `Got name ${options.packager.name} from options. No inferring needed`,
    );
    return sanitizeFilename(options.packager.platform, options.packager.name);
  }

  const inferredName = await tryToInferName(options.packager.targetUrl);
  return sanitizeFilename(options.packager.platform, inferredName);
}
