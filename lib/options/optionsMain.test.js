'use strict';

var _optionsMain = require('./optionsMain');

var _optionsMain2 = _interopRequireDefault(_optionsMain);

var _asyncConfig = require('./asyncConfig');

var _asyncConfig2 = _interopRequireDefault(_asyncConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

jest.mock('./asyncConfig');
var mockedAsyncConfig = { some: 'options' };
_asyncConfig2.default.mockImplementation(function () {
  return Promise.resolve(mockedAsyncConfig);
});

test('it should call the async config', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var params, result;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          params = {
            targetUrl: 'http://example.com'
          };
          _context.next = 3;
          return (0, _optionsMain2.default)(params);

        case 3:
          result = _context.sent;

          expect(_asyncConfig2.default).toHaveBeenCalledWith(expect.objectContaining(params));
          expect(result).toEqual(mockedAsyncConfig);

        case 6:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, undefined);
})));

// TODO add more tests
//# sourceMappingURL=optionsMain.test.js.map
