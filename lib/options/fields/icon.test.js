'use strict';

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _icon = require('./icon');

var _icon2 = _interopRequireDefault(_icon);

var _infer = require('../../infer');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

jest.mock('./../../infer/inferIcon');
jest.mock('loglevel');

var mockedResult = 'icon path';

describe('when the icon parameter is passed', function () {
  test('it should return the icon parameter', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var params;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            expect(_infer.inferIcon).toHaveBeenCalledTimes(0);

            params = { icon: './icon.png' };
            _context.next = 4;
            return expect((0, _icon2.default)(params)).resolves.toBe(params.icon);

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));
});

describe('when the icon parameter is not passed', function () {
  test('it should call inferIcon', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var params, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _infer.inferIcon.mockImplementationOnce(function () {
              return Promise.resolve(mockedResult);
            });
            params = { targetUrl: 'some url', platform: 'mac' };
            _context2.next = 4;
            return (0, _icon2.default)(params);

          case 4:
            result = _context2.sent;


            expect(result).toBe(mockedResult);
            expect(_infer.inferIcon).toHaveBeenCalledWith(params.targetUrl, params.platform);

          case 7:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  describe('when inferIcon resolves with an error', function () {
    test('it should handle the error', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var params, result;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _infer.inferIcon.mockImplementationOnce(function () {
                return Promise.reject(new Error('some error'));
              });
              params = { targetUrl: 'some url', platform: 'mac' };
              _context3.next = 4;
              return (0, _icon2.default)(params);

            case 4:
              result = _context3.sent;

              expect(result).toBe(null);
              expect(_infer.inferIcon).toHaveBeenCalledWith(params.targetUrl, params.platform);
              expect(_loglevel2.default.warn).toHaveBeenCalledTimes(1);

            case 8:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));
  });
});
//# sourceMappingURL=icon.test.js.map
