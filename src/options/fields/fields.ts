import * as log from 'loglevel';

import { icon } from './icon';
import { userAgent } from './userAgent';
import { name } from './name';

const OPTIONS_NEEDING_POSTPROCESSING = [
  {
    optionName: 'userAgent',
    processor: userAgent,
  },
  {
    optionName: 'icon',
    processor: icon,
  },
  {
    optionName: 'name',
    processor: name,
  },
];

export function getProcessedOptions(options): Promise<any[]> {
  return Promise.all(
    OPTIONS_NEEDING_POSTPROCESSING.map(async ({ optionName, processor }) => {
      const result = await processor(options);

      return {
        [optionName]: result,
      };
    }),
  );
}
