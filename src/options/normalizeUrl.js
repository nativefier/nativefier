import url from 'url';
import validator from 'validator';

function normalizeUrl(testUrl) {
    // add protocol if protocol not found
    let normalized = testUrl;
    const parsed = url.parse(normalized);
    if (!parsed.protocol) {
        normalized = 'http://' + normalized;
    }

    const validatorOptions = {
        require_protocol: true,
        require_tld: false,
        allow_trailing_dot: true // mDNS addresses, https://github.com/jiahaog/nativefier/issues/308
    };
    if (!validator.isURL(normalized, validatorOptions)) {
        throw `Your Url: "${normalized}" is invalid!`;
    }
    return normalized;
}

export default normalizeUrl;
