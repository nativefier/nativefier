import * as log from 'loglevel';

import { getProcessedOptions } from './fields/fields';

function resultArrayToObject(fieldResults): any {
  return fieldResults.reduce(
    (accumulator, value) => ({ ...accumulator, ...value }),
    {},
  );
}

function inferredOptions(oldOptions, fieldResults): any {
  const newOptions = resultArrayToObject(fieldResults);
  return { ...oldOptions, ...newOptions };
}

/**
 * Takes the options object and infers new values needing async work
 */
export async function asyncConfig(options): Promise<any> {
  log.debug('\nPerforming async options post-processing.');
  const processedOptions = await getProcessedOptions(options);
  return inferredOptions(options, processedOptions);
}
