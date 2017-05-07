import optionsMain from './optionsMain';
import asyncConfig from './asyncConfig';

jest.mock('./asyncConfig');
const mockedAsyncConfig = { some: 'options' };
asyncConfig.mockImplementation(() => Promise.resolve(mockedAsyncConfig));

test('it should call the async config', () => {
  const params = {
    targetUrl: 'http://example.com',
  };
  return optionsMain(params).then((result) => {
    expect(asyncConfig).toHaveBeenCalledWith(expect.objectContaining(params));
    expect(result).toEqual(mockedAsyncConfig);
  });
});

// TODO add more tests
