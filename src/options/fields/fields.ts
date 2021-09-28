import { icon } from './icon';
import { userAgent } from './userAgent';
import { AppOptions } from '../../../shared/src/options/model';
import { name } from './name';

type OptionPostprocessor = {
  namespace: 'nativefier' | 'packager';
  option: 'icon' | 'name' | 'userAgent';
  processor: (options: AppOptions) => Promise<string | undefined>;
};

const OPTION_POSTPROCESSORS: OptionPostprocessor[] = [
  { namespace: 'nativefier', option: 'userAgent', processor: userAgent },
  { namespace: 'packager', option: 'icon', processor: icon },
  { namespace: 'packager', option: 'name', processor: name },
];

export async function processOptions(options: AppOptions): Promise<AppOptions> {
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
    if (
      result &&
      namespace in options &&
      options[namespace] &&
      option in options[namespace]
    ) {
      // @ts-expect-error We're fiddling with objects at the string key level, which TS doesn't support well.
      options[namespace][option] = result;
    }
  }
  return options;
}
