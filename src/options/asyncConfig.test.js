import asyncConfig from './asyncConfig';
import fields from './fields';

jest.mock('./fields');

fields.mockImplementation(() => [
  Promise.resolve({
    someField: 'newValue',
  }),
]);

test('it should merge the result of the promise', async () => {
  const param = { another: 'field', someField: 'oldValue' };
  const expected = { another: 'field', someField: 'newValue' };

  const result = await asyncConfig(param);
  expect(result).toEqual(expected);
});
