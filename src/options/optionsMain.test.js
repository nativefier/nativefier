import { getOptions } from './optionsMain';
import { asyncConfig } from './asyncConfig';

jest.mock('./asyncConfig');
const mockedAsyncConfig = { some: 'options' };
asyncConfig.mockImplementation(() => Promise.resolve(mockedAsyncConfig));

test('it should call the async config', async () => {
  const params = {
    targetUrl: 'http://example.com',
  };
  const result = await getOptions(params);
  expect(asyncConfig).toHaveBeenCalledWith(expect.objectContaining(params));
  expect(result).toEqual(mockedAsyncConfig);
});

// TODO add more tests
