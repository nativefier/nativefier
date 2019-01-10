'use strict';

var _asyncConfig = require('./asyncConfig');

var _asyncConfig2 = _interopRequireDefault(_asyncConfig);

var _fields = require('./fields');

var _fields2 = _interopRequireDefault(_fields);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

jest.mock('./fields');

_fields2.default.mockImplementation(function () {
  return [Promise.resolve({
    someField: 'newValue'
  })];
});

test('it should merge the result of the promise', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var param, expected, result;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          param = { another: 'field', someField: 'oldValue' };
          expected = { another: 'field', someField: 'newValue' };
          _context.next = 4;
          return (0, _asyncConfig2.default)(param);

        case 4:
          result = _context.sent;

          expect(result).toEqual(expected);

        case 6:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, undefined);
})));
//# sourceMappingURL=asyncConfig.test.js.map
