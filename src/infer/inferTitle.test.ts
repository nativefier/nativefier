import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { inferTitle } from './inferTitle';

test('it returns the correct title', async () => {
  const axiosGetMock = jest.spyOn(axios, 'get');
  const mockedResponse: AxiosResponse<string> = {
    data: `
      <HTML>
        <head>
          <title>TEST_TITLE</title>
        </head>
      </HTML>`,
    status: 200,
    statusText: 'OK',
    headers: {},
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config: {} as unknown as InternalAxiosRequestConfig<unknown>,
  };
  axiosGetMock.mockResolvedValue(mockedResponse);
  const result = await inferTitle('someurl');

  expect(axiosGetMock).toHaveBeenCalledTimes(1);
  expect(result).toBe('TEST_TITLE');
});
