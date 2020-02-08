import { getOptions } from './optionsMain';
import * as asyncConfig from './asyncConfig';

const mockedAsyncConfig = { some: 'options' };
let asyncConfigMock: jasmine.Spy;

beforeAll(() => {
  asyncConfigMock = spyOn(asyncConfig, 'asyncConfig').and.returnValue(
    mockedAsyncConfig,
  );
});

test('it should call the async config', async () => {
  const params = {
    targetUrl: 'https://example.com/',
  };
  const result = await getOptions(params);
  expect(asyncConfigMock).toHaveBeenCalledWith(expect.objectContaining(params));
  expect(result).toEqual(mockedAsyncConfig);
});
