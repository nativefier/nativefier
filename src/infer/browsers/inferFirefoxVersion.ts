import axios from 'axios';
import * as log from 'loglevel';
import { DEFAULT_FIREFOX_VERSION } from '../../constants';

type FirefoxVersions = {
  FIREFOX_AURORA: string;
  FIREFOX_DEVEDITION: string;
  FIREFOX_ESR: string;
  FIREFOX_ESR_NEXT: string;
  FIREFOX_NIGHTLY: string;
  LAST_MERGE_DATE: string;
  LAST_RELEASE_DATE: string;
  LAST_SOFTFREEZE_DATE: string;
  LATEST_FIREFOX_DEVEL_VERSION: string;
  LATEST_FIREFOX_OLDER_VERSION: string;
  LATEST_FIREFOX_RELEASED_DEVEL_VERSION: string;
  LATEST_FIREFOX_VERSION: string;
  NEXT_MERGE_DATE: string;
  NEXT_RELEASE_DATE: string;
  NEXT_SOFTFREEZE_DATE: string;
};

const FIREFOX_VERSIONS_URL =
  'https://product-details.mozilla.org/1.0/firefox_versions.json';

export async function getLatestFirefoxVersion(
  url = FIREFOX_VERSIONS_URL,
): Promise<string> {
  try {
    log.debug('Grabbing Firefox version data from', url);
    const response = await axios.get<FirefoxVersions>(url, { timeout: 5000 });
    if (response.status !== 200) {
      throw new Error(`Bad request: Status code ${response.status}`);
    }
    const firefoxVersions: FirefoxVersions = response.data;

    log.debug(
      `Got latest Firefox version ${firefoxVersions.LATEST_FIREFOX_VERSION}`,
    );
    return firefoxVersions.LATEST_FIREFOX_VERSION;
  } catch (err: unknown) {
    log.error('getLatestFirefoxVersion ERROR', err);
    log.debug(
      'Falling back to default Firefox version',
      DEFAULT_FIREFOX_VERSION,
    );
    return DEFAULT_FIREFOX_VERSION;
  }
}
