import request from 'request';
import cheerio from 'cheerio';

function inferTitle(url, callback) {
    const options = {
        url: url,
        headers: {
            // fake a user agent because pages like http://messenger.com will throw 404 error
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36'
        }
    };

    request(options, (error, response, body) => {
        if (error || response.statusCode !== 200) {
            callback(`Request Error: ${error}, Status Code ${response ? response.statusCode : 'No Response'}`);
            return;
        }

        const $ = cheerio.load(body);
        const pageTitle = $('title').text().replace(/\//g, '');
        callback(null, pageTitle);
    });
}

export default inferTitle;
