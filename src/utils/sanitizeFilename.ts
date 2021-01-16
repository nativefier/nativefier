import * as log from 'loglevel';

import { DEFAULT_APP_NAME } from '../constants';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sanitize = require('sanitize-filename');

export function sanitizeFilename(
  platform: string,
  filenameToSanitize: string,
): string {
  let result: string = sanitize(filenameToSanitize);

  // remove all non ascii / file-problematic chars, or use default app name
  /* eslint-disable no-control-regex */
  result =
    result.replace(/[^\x00-\x7F]/g, '').replace(/[/,;.\\]/g, '') ||
    DEFAULT_APP_NAME;
  /* eslint-enable no-control-regex */

  // spaces will cause problems with Ubuntu when pinned to the dock
  if (platform === 'linux') {
    result = result.replace(/\s/g, '');
  }
  log.debug(`Sanitized filename for ${filenameToSanitize} : ${result}`);
  return result;
}
