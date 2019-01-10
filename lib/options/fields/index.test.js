'use strict';

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

var _icon = require('./icon');

var _icon2 = _interopRequireDefault(_icon);

var _userAgent = require('./userAgent');

var _userAgent2 = _interopRequireDefault(_userAgent);

var _name = require('./name');

var _name2 = _interopRequireDefault(_name);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock('./icon');
jest.mock('./name');
jest.mock('./userAgent');

var modules = [_icon2.default, _userAgent2.default, _name2.default];
modules.forEach(function (module) {
  module.mockImplementation(function () {
    return Promise.resolve();
  });
});

test('it should return a list of promises', function () {
  var result = (0, _index2.default)({});
  expect(result).toHaveLength(3);
  result.forEach(function (value) {
    expect(value).toBeInstanceOf(Promise);
  });
});
//# sourceMappingURL=index.test.js.map
