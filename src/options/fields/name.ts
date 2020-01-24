import { sanitizeFilename } from '../../utils';
import { inferTitle } from '../../infer';
import { DEFAULT_APP_NAME } from '../../constants';

import log = require('loglevel');

async function tryToInferName(targetUrl: string): Promise<string> {
  try {
    const pageTitle = await inferTitle(targetUrl);
    return pageTitle || DEFAULT_APP_NAME;
  } catch (error) {
    log.warn(
      `Unable to automatically determine app name, falling back to '${DEFAULT_APP_NAME}'. Reason: ${error}`,
    );
    return DEFAULT_APP_NAME;
  }
}

export async function name({
  nameToUse,
  platform,
  targetUrl,
}): Promise<string> {
  // .length also checks if its the commanderJS function or a string
  if (nameToUse && nameToUse.length > 0) {
    return sanitizeFilename(platform, nameToUse);
  }

  const inferredName = await tryToInferName(targetUrl);
  return sanitizeFilename(platform, inferredName);
}
