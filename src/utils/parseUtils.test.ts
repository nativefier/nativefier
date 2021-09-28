import { parseBoolean } from './parseUtils';

test.each([
  ['true', true, true],
  ['1', true, true],
  ['yes', true, true],
  [1, true, true],
  [true, true, true],
  ['false', false, true],
  ['0', false, true],
  ['no', false, true],
  [0, false, true],
  [false, false, true],
  [undefined, true, true],
  [undefined, false, false],
])(
  'parseBoolean("%s") === %s (default = %s)',
  (
    testValue: boolean | string | number | undefined,
    expectedResult: boolean,
    _default: boolean,
  ) => {
    expect(parseBoolean(testValue, _default)).toBe(expectedResult);
  },
);
