import axios from 'axios';
import cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36';

function inferTitle(url) {
  const options = {
    method: 'get',
    url,
    headers: {
      // fake a user agent because pages like http://messenger.com will throw 404 error
      'User-Agent': USER_AGENT,
    },
  };

  return axios(options).then(({ data }) => {
    const $ = cheerio.load(data);
    return $('title').first().text().replace(/\//g, '');
  });
}

export default inferTitle;
