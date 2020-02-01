import { getProcessedOptions } from './fields';
import { icon } from './icon';
import { userAgent } from './userAgent';
import { name } from './name';

jest.mock('./icon');
jest.mock('./name');
jest.mock('./userAgent');

const modules = [icon, userAgent, name];
for (const module of modules) {
  (module as jest.Mock).mockImplementation(() => Promise.resolve());
}

test('it should resolve to a list', async () => {
  const results = await getProcessedOptions({});
  expect(results).toEqual([
    { userAgent: undefined },
    { icon: undefined },
    { name: undefined },
  ]);
});
