import { getProcessedOptions } from './fields';

function resultArrayToObject(fieldResults) {
  return fieldResults.reduce(
    (accumulator, value) => ({ ...accumulator, ...value }),
    {},
  );
}

function inferredOptions(oldOptions, fieldResults) {
  const newOptions = resultArrayToObject(fieldResults);
  return { ...oldOptions, ...newOptions };
}

/**
 * Takes the options object and infers new values needing async work
 */
export async function asyncConfig(options) {
  const processedOptions = await getProcessedOptions(options);
  return inferredOptions(options, processedOptions);
}
