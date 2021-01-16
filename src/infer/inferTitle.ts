import axios from 'axios';
import * as log from 'loglevel';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36';

export async function inferTitle(url: string): Promise<string> {
  const { data } = await axios.get(url, {
    headers: {
      // Fake user agent for pages like http://messenger.com
      'User-Agent': USER_AGENT,
    },
  });
  log.debug(`Fetched ${(data.length / 1024).toFixed(1)} kb page at`, url);
  const inferredTitle =
    /<\s*title.*?>(?<title>.+?)<\s*\/title\s*?>/i.exec(data).groups?.title ||
    'Webapp';
  log.debug('Inferred title:', inferredTitle);
  return inferredTitle;
}
