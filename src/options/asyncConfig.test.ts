import { asyncConfig } from './asyncConfig';
import { getProcessedOptions } from './fields/fields';

jest.mock('./fields/fields');

(getProcessedOptions as jest.Mock).mockResolvedValue([
  {
    someField: 'newValue',
  },
]);

test('it should merge the results', async () => {
  const param = { another: 'field', someField: 'oldValue' };
  const expected = { another: 'field', someField: 'newValue' };

  const result = await asyncConfig(param);
  expect(result).toEqual(expected);
});
