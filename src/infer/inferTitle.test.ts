import axios from 'axios';

import { inferTitle } from './inferTitle';

test('it returns the correct title', async () => {
  const axiosGetMock = jest.spyOn(axios, 'get');
  axiosGetMock.mockResolvedValue({
    data: `
      <HTML>
        <head>
          <title>TEST_TITLE</title>
        </head>
      </HTML>`,
  });
  const result = await inferTitle('someurl');

  expect(axiosGetMock).toHaveBeenCalledTimes(1);
  expect(result).toBe('TEST_TITLE');
});
