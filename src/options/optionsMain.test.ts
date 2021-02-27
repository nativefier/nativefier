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
  expect(asyncConfigMock).toHaveBeenCalledWith(
    expect.objectContaining({
      packager: expect.anything(),
      nativefier: expect.anything(),
    }),
  );
  expect(result.packager.targetUrl).toEqual(params.targetUrl);
});

test('it should set the accessibility prompt option to true by default', async () => {
  const params = {
    targetUrl: 'https://example.com/',
  };
  const result = await getOptions(params);
  expect(asyncConfigMock).toHaveBeenCalledWith(
    expect.objectContaining({
      nativefier: expect.objectContaining({
        accessibilityPrompt: true,
      }),
    }),
  );
  expect(result.nativefier.accessibilityPrompt).toEqual(true);
});
