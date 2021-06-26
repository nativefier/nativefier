import 'source-map-support/register';

import { buildNativefierApp } from './build/buildNativefierApp';
import { RawOptions } from '../shared/src/options/model';

export { buildNativefierApp };

/**
 * Only for compatibility with Nativefier <= 7.7.1 !
 * Use the better, modern async `buildNativefierApp` instead if you can!
 */
function buildNativefierAppOldCallbackStyle(
  options: RawOptions, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  callback: (err?: Error, result?: string) => void,
): void {
  buildNativefierApp(options)
    .then((result) => callback(undefined, result))
    .catch((err: Error) => callback(err));
}

export default buildNativefierAppOldCallbackStyle;
