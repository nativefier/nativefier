import * as log from 'loglevel';

import { isWindows } from '../helpers/helpers';

export function parseBoolean(
  val: boolean | string | number | undefined,
  _default: boolean,
): boolean {
  if (val === undefined) {
    return _default;
  }
  try {
    if (typeof val === 'boolean') {
      return val;
    }
    val = String(val);
    switch (val.toLocaleLowerCase()) {
      case 'true':
      case '1':
      case 'yes':
        return true;
      case 'false':
      case '0':
      case 'no':
        return false;
      default:
        return _default;
    }
  } catch {
    return _default;
  }
}

export function parseBooleanOrString(val: string): boolean | string {
  switch (val) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return val;
  }
}

export function parseJson<Type>(val: string): Type | undefined {
  if (!val) return undefined;
  try {
    return JSON.parse(val) as Type;
  } catch (err: unknown) {
    const windowsShellHint = isWindows()
      ? `\n   In particular, Windows cmd doesn't have single quotes, so you have to use only double-quotes plus escaping: "{\\"someKey\\": \\"someValue\\"}"`
      : '';

    log.error(
      `Unable to parse JSON value: ${val}\n` +
        `JSON should look like {"someString": "someValue", "someBoolean": true, "someArray": [1,2,3]}.\n` +
        ` - Only double quotes are allowed, single quotes are not.\n` +
        ` - Learn how your shell behaves and escapes characters.${windowsShellHint}\n` +
        ` - If unsure, validate your JSON using an online service.`,
    );
    throw err;
  }
}
