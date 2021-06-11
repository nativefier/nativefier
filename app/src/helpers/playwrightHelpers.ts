export const IS_PLAYWRIGHT = safeGetEnv('PLAYWRIGHT_TEST') === '1';
export const PLAYWRIGHT_CONFIG = safeGetEnv('PLAYWRIGHT_CONFIG');

export function safeGetEnv(key: string): string | undefined {
  return key in process.env ? process.env[key] : undefined;
}
