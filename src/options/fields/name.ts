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
  } catch (err: unknown) {
    log.warn(
      `Unable to automatically determine app name, falling back to '${DEFAULT_APP_NAME}'.`,
      err,
    );
    return DEFAULT_APP_NAME;
  }
}

export async function name(options: NameParams): Promise<string> {
  let name: string | undefined = options.packager.name;
  if (!name) {
    name = await tryToInferName(options.packager.targetUrl);
  }

  return sanitizeFilename(options.packager.platform, name);
}
