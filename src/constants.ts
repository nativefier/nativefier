import * as path from 'path';

export const DEFAULT_APP_NAME = 'APP';

// Update both together, and update app / package.json / devDeps / electron
export const DEFAULT_ELECTRON_VERSION = '12.0.6';
export const DEFAULT_CHROME_VERSION = '89.0.4389.128';

export const ELECTRON_MAJOR_VERSION = parseInt(
  DEFAULT_ELECTRON_VERSION.split('.')[0],
  10,
);
export const PLACEHOLDER_APP_DIR = path.join(__dirname, './../', 'app');
