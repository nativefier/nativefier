'use strict';

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _inferTitle = require('./inferTitle');

var _inferTitle2 = _interopRequireDefault(_inferTitle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

jest.mock('axios', function () {
  return jest.fn(function () {
    return Promise.resolve({
      data: `
        <HTML>
          <head>
            <title>TEST_TITLE</title>
          </head>
        </HTML>`
    });
  });
});

test('it returns the correct title', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var result;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _inferTitle2.default)('someurl');

        case 2:
          result = _context.sent;

          expect(_axios2.default).toHaveBeenCalledTimes(1);
          expect(result).toBe('TEST_TITLE');

        case 5:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, undefined);
})));
//# sourceMappingURL=inferTitle.test.js.map
