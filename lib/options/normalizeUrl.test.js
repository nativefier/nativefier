'use strict';

var _normalizeUrl = require('./normalizeUrl');

var _normalizeUrl2 = _interopRequireDefault(_normalizeUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

test("a proper URL shouldn't be mangled", function () {
  expect((0, _normalizeUrl2.default)('http://www.google.com')).toEqual('http://www.google.com');
});

test('missing protocol should default to http', function () {
  expect((0, _normalizeUrl2.default)('www.google.com')).toEqual('http://www.google.com');
});

test("a proper URL shouldn't be mangled", function () {
  expect(function () {
    (0, _normalizeUrl2.default)('http://ssddfoo bar');
  }).toThrow('Your Url: "http://ssddfoo bar" is invalid!');
});
//# sourceMappingURL=normalizeUrl.test.js.map
