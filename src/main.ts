import 'source-map-support/register';

import { buildNativefierApp } from './build/buildNativefierApp';

export { buildNativefierApp };

/**
 * Only for compatibility with Nativefier <= 7.7.1 !
 * Use the better, modern async `buildNativefierApp` instead if you can!
 */
function buildNativefierAppOldCallbackStyle(
  options: any, // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  callback: (err: any, result?: any) => void,
): void {
  buildNativefierApp(options)
    .then((result) => callback(null, result))
    .catch((err) => callback(err));
}

export default buildNativefierAppOldCallbackStyle;
