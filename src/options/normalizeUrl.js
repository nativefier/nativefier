import url from 'url';
import validator from 'validator';

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

export default normalizeUrl;
