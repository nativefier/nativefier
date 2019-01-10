'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36';

function inferTitle(url) {
  var options = {
    method: 'get',
    url,
    headers: {
      // fake a user agent because pages like http://messenger.com will throw 404 error
      'User-Agent': USER_AGENT
    }
  };

  return (0, _axios2.default)(options).then(function (_ref) {
    var data = _ref.data;

    var $ = _cheerio2.default.load(data);
    return $('title').first().text();
  });
}

exports.default = inferTitle;
//# sourceMappingURL=inferTitle.js.map
