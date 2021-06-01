import * as log from 'loglevel';
import sanitize = require('sanitize-filename');

import { DEFAULT_APP_NAME } from '../constants';

export function sanitizeFilename(
  platform: string,
  filenameToSanitize: string,
): string {
  let result: string = sanitize(filenameToSanitize);

  // spaces will cause problems with Ubuntu when pinned to the dock
  if (platform === 'linux') {
    result = result.replace(/\s/g, '');
  }

  if (!result || result === '') {
    result = DEFAULT_APP_NAME;
  }
  log.debug(`Sanitized filename for ${filenameToSanitize} : ${result}`);
  return result;
}
