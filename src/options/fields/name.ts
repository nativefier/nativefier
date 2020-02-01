import * as log from 'loglevel';

import { sanitizeFilename } from '../../utils/sanitizeFilename';
import { inferTitle } from '../../infer/inferTitle';
import { DEFAULT_APP_NAME } from '../../constants';

type NameParams = {
  name?: string;
  targetUrl: string;
  platform: string;
};

async function tryToInferName(targetUrl: string): Promise<string> {
  try {
    log.debug('Inferring name for', targetUrl);
    const pageTitle = await inferTitle(targetUrl);
    return pageTitle || DEFAULT_APP_NAME;
  } catch (error) {
    log.warn(
      `Unable to automatically determine app name, falling back to '${DEFAULT_APP_NAME}'. Reason: ${error}`,
    );
    return DEFAULT_APP_NAME;
  }
}

export async function name(params: NameParams): Promise<string> {
  if ('name' in params && params.name) {
    log.debug(`Got name ${params.name} from options. No inferring needed`);
    return sanitizeFilename(params.platform, params.name);
  }

  const inferredName = await tryToInferName(params.targetUrl);
  return sanitizeFilename(params.platform, inferredName);
}
