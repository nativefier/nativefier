import * as path from 'path';

export const DEFAULT_APP_NAME = 'APP';

// Update both together
export const DEFAULT_ELECTRON_VERSION = '11.1.1';
export const DEFAULT_CHROME_VERSION = '87.0.4280.88';

export const ELECTRON_MAJOR_VERSION = parseInt(
  DEFAULT_ELECTRON_VERSION.split('.')[0],
  10,
);
export const PLACEHOLDER_APP_DIR = path.join(__dirname, './../', 'app');
