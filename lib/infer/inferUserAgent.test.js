'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _inferUserAgent = require('./inferUserAgent');

var _inferUserAgent2 = _interopRequireDefault(_inferUserAgent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var TEST_RESULT = {
  darwin: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
  mas: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
  win32: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36',
  linux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36'
};

function testPlatform(platform) {
  return expect((0, _inferUserAgent2.default)('0.37.1', platform)).resolves.toBe(TEST_RESULT[platform]);
}

describe('Infer User Agent', function () {
  test('Can infer userAgent for all platforms', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var testPromises;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            testPromises = _lodash2.default.keys(TEST_RESULT).map(function (platform) {
              return testPlatform(platform);
            });
            _context.next = 3;
            return Promise.all(testPromises);

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  test('Connection error will still get a user agent', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var TIMEOUT_URL;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            jest.setTimeout(6000);

            TIMEOUT_URL = 'http://www.google.com:81/';
            _context2.next = 4;
            return expect((0, _inferUserAgent2.default)('1.6.7', 'darwin', TIMEOUT_URL)).resolves.toBe('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));
});
//# sourceMappingURL=inferUserAgent.test.js.map
