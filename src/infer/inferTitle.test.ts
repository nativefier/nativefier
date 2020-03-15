import axios, { AxiosResponse } from 'axios';

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
    config: {},
  };
  axiosGetMock.mockResolvedValue(mockedResponse);
  const result = await inferTitle('someurl');

  expect(axiosGetMock).toHaveBeenCalledTimes(1);
  expect(result).toBe('TEST_TITLE');
});
