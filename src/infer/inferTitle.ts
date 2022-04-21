import axios from 'axios';
import * as log from 'loglevel';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15';

export async function inferTitle(url: string): Promise<string> {
  const { data } = await axios.get<string>(url, {
    headers: {
      // Fake user agent for pages like http://messenger.com
      'User-Agent': USER_AGENT,
    },
  });
  log.debug(`Fetched ${(data.length / 1024).toFixed(1)} kb page at`, url);
  const inferredTitle =
    /<\s*title.*?>(?<title>.+?)<\s*\/title\s*?>/i.exec(data)?.groups?.title ??
    'Webapp';
  log.debug('Inferred title:', inferredTitle);
  return inferredTitle;
}
