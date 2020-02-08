import * as path from 'path';

export const DEFAULT_APP_NAME = 'APP';
export const ELECTRON_VERSION = '8.0.0';
export const ELECTRON_MAJOR_VERSION = parseInt(
  ELECTRON_VERSION.split('.')[0],
  10,
);
// TODO restore './../../' to './../' once TS output fixed from /lib/src to /lib
export const PLACEHOLDER_APP_DIR = path.join(__dirname, './../../', 'app');
