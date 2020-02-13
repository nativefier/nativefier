import * as log from 'loglevel';

import { processOptions } from './fields/fields';
import { AppOptions } from './model';

/**
 * Takes the options object and infers new values needing async work
 */
export async function asyncConfig(options: AppOptions): Promise<any> {
  log.debug('\nPerforming async options post-processing.');
  await processOptions(options);
}
