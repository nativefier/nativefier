import os from 'os';
import path from 'path';
import url from 'url';

import request from 'request';
import cheerio from 'cheerio';
import validator from 'validator';

const TEMPLATE_APP_DIR = path.join(__dirname, '../', 'app');
const ELECTRON_VERSION = '0.36.4';
const DEFAULT_APP_NAME = 'My App';

function optionsFactory(name,
                        targetUrl,
                        platform = detectPlatform(),
                        arch = detectArch(),
                        version = ELECTRON_VERSION,
                        outDir = process.cwd(),
                        overwrite = false,
                        conceal = false,
                        icon,
                        badge = false,
                        width = 1280,
                        height = 800,
                        userAgent,
                        pretend,
                        callback) {

    targetUrl = normalizeUrl(targetUrl);

    if (!width) {
        width = 1280;
    }

    if (!height) {
        height = 800;
    }

    if (!userAgent && pretend) {
        userAgent = getFakeUserAgent();
    }

    const options = {
        dir: TEMPLATE_APP_DIR,

        name: name,
        targetUrl: targetUrl,

        platform: platform,
        arch: arch,
        version: version,

        out: outDir,

        // optionals
        overwrite: overwrite,
        asar: conceal,
        icon: icon,

        // app configuration
        badge: badge,
        width: width,
        height: height,
        userAgent: userAgent
    };

    if (name && name.length > 0) {
        options.name = name;
        callback(null, options);
        return;
    }

    getTitle(options.targetUrl, function (error, pageTitle) {
        if (error) {
            console.warn(`Unable to automatically determine app name, falling back to '${DEFAULT_APP_NAME}'`);
            options.name = DEFAULT_APP_NAME;
        } else {
            options.name = pageTitle;
        }

        callback(null, options);
    });
}

function detectPlatform() {
    const platform = os.platform();
    if (platform === 'darwin' || platform === 'win32' || platform === 'linux') {
        return platform;
    }

    console.warn(`Warning: Untested platform ${platform} detected, assuming linux`);
    return 'linux';
}

function detectArch() {
    const arch = os.arch();
    if (arch !== 'ia32' && arch !== 'x64') {
        throw `Incompatible architecture ${arch} detected`;
    }
    return os.arch();
}

function getTitle(url, callback) {
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
        const pageTitle = $("title").text().replace(/\//g, "");
        callback(null, pageTitle);
    });
}

function normalizeUrl(testUrl) {
    // add protocol if protocol not found
    let normalized = testUrl;
    const parsed = url.parse(normalized);
    if (!parsed.protocol) {
        normalized = 'http://' + normalized;
    }
    if (!validator.isURL(normalized, {require_protocol: true, require_tld: false})) {
        throw `Your Url: "${normalized}" is invalid!`;
    }
    return normalized;
}

function getFakeUserAgent() {
    let userAgent;
    switch (os.platform()) {
        case 'darwin':
            userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36';
            break;
        case 'win32':
            userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
            break;
        case 'linux':
            userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36';
            break;
    }
    return userAgent;
}

export default optionsFactory;
