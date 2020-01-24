import axios from 'axios';
import * as cheerio from 'cheerio';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36';

export async function inferTitle(url: string): Promise<string> {
  const { data } = await axios.get(url, {
    headers: {
      // Fake user agent for pages like http://messenger.com
      'User-Agent': USER_AGENT,
    },
  });
  const $ = cheerio.load(data);
  return $('title')
    .first()
    .text();
}
