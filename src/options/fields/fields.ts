import { icon } from './icon';
import { userAgent } from './userAgent';
import { AppOptions } from '../model';
import { name } from './name';

const OPTION_POSTPROCESSORS = [
  { namespace: 'nativefier', option: 'userAgent', processor: userAgent },
  { namespace: 'packager', option: 'icon', processor: icon },
  { namespace: 'packager', option: 'name', processor: name },
];

export async function processOptions(options: AppOptions): Promise<void> {
  const processedOptions = await Promise.all(
    OPTION_POSTPROCESSORS.map(async ({ namespace, option, processor }) => {
      const result = await processor(options);
      return {
        namespace,
        option,
        result,
      };
    }),
  );

  for (const { namespace, option, result } of processedOptions) {
    if (result !== null) {
      options[namespace][option] = result;
    }
  }
}
