import * as path from 'path';

export const DEFAULT_APP_NAME = 'APP';

// Update both DEFAULT_ELECTRON_VERSION and DEFAULT_CHROME_VERSION together,
// and update app / package.json / devDeps / electron to value of DEFAULT_ELECTRON_VERSION
export const DEFAULT_ELECTRON_VERSION = '14.2.3';
// https://atom.io/download/atom-shell/index.json
export const DEFAULT_CHROME_VERSION = '93.0.4577.82';

// Update each of these periodically
// https://product-details.mozilla.org/1.0/firefox_versions.json
export const DEFAULT_FIREFOX_VERSION = '95.0.2';

// https://en.wikipedia.org/wiki/Safari_version_history
export const DEFAULT_SAFARI_VERSION = {
  majorVersion: 15,
  version: '15.0',
  webkitVersion: '605.1.15',
};

export const ELECTRON_MAJOR_VERSION = parseInt(
  DEFAULT_ELECTRON_VERSION.split('.')[0],
  10,
);
export const PLACEHOLDER_APP_DIR = path.join(__dirname, './../', 'app');
