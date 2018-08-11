import axios from 'axios';
import inferTitle from './inferTitle';

jest.mock('axios', () =>
  jest.fn(() =>
    Promise.resolve({
      data: `
        <HTML>
          <head>
            <title>TEST_TITLE</title>
          </head>
        </HTML>`,
    }),
  ),
);

test('it returns the correct title', async () => {
  const result = await inferTitle('someurl');
  expect(axios).toHaveBeenCalledTimes(1);
  expect(result).toBe('TEST_TITLE');
});
