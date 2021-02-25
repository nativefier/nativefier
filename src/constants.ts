import * as path from 'path';

export const DEFAULT_APP_NAME = 'APP';

// Update both together, and update app / package.json / devDeps / electron
export const DEFAULT_ELECTRON_VERSION = '11.3.0';
export const DEFAULT_CHROME_VERSION = '87.0.4280.141';

export const ELECTRON_MAJOR_VERSION = parseInt(
  DEFAULT_ELECTRON_VERSION.split('.')[0],
  10,
);
export const PLACEHOLDER_APP_DIR = path.join(__dirname, './../', 'app');
