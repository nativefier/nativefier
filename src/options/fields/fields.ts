import { icon } from './icon';
import { userAgent } from './userAgent';
import { AppOptions } from '../model';
import { name } from './name';

const OPTION_POSTPROCESSORS = [userAgent, icon, name];

export async function processOptions(options: AppOptions): Promise<void> {
  await Promise.all(
    OPTION_POSTPROCESSORS.map(async (processorFn) => {
      await processorFn(options);
    }),
  );
}
