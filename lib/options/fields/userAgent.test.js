'use strict';

var _userAgent = require('./userAgent');

var _userAgent2 = _interopRequireDefault(_userAgent);

var _infer = require('../../infer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

jest.mock('./../../infer/inferUserAgent');

test('when a userAgent parameter is passed', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var params;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          expect(_infer.inferUserAgent).toHaveBeenCalledTimes(0);

          params = { userAgent: 'valid user agent' };
          _context.next = 4;
          return expect((0, _userAgent2.default)(params)).resolves.toBe(params.userAgent);

        case 4:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, undefined);
})));

test('no userAgent parameter is passed', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
  var params;
  return regeneratorRuntime.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          params = { electronVersion: '123', platform: 'mac' };
          _context2.next = 3;
          return (0, _userAgent2.default)(params);

        case 3:
          expect(_infer.inferUserAgent).toHaveBeenCalledWith(params.electronVersion, params.platform);

        case 4:
        case 'end':
          return _context2.stop();
      }
    }
  }, _callee2, undefined);
})));
//# sourceMappingURL=userAgent.test.js.map
