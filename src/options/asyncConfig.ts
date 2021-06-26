import * as log from 'loglevel';

import { processOptions } from './fields/fields';
import { AppOptions } from '../../shared/src/options/model';

/**
 * Takes the options object and infers new values needing async work
 */
export async function asyncConfig(options: AppOptions): Promise<AppOptions> {
  log.debug('\nPerforming async options post-processing.');
  return await processOptions(options);
}
