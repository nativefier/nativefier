import _ from 'lodash';
import sanitizeFilenameLib from 'sanitize-filename';
import { DEFAULT_APP_NAME } from './../constants';

export default function (platform, str) {
  let result = sanitizeFilenameLib(str);

  // remove all non ascii or use default app name
  // eslint-disable-next-line no-control-regex
  result = result.replace(/[^\x00-\x7F]/g, '') || DEFAULT_APP_NAME;

  // spaces will cause problems with Ubuntu when pinned to the dock
  if (platform === 'linux') {
    return _.kebabCase(result);
  }
  return result;
}
