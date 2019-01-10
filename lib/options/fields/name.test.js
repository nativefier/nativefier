'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _name = require('./name');

var _name2 = _interopRequireDefault(_name);

var _constants = require('../../constants');

var _infer = require('../../infer');

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

jest.mock('./../../infer/inferTitle');
jest.mock('./../../utils/sanitizeFilename');
jest.mock('loglevel');

_utils.sanitizeFilename.mockImplementation(function (_, filename) {
  return filename;
});

var mockedResult = 'mock name';

describe('well formed name parameters', function () {
  var params = { name: 'appname', platform: 'something' };
  test('it should not call inferTitle', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var result;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _name2.default)(params);

          case 2:
            result = _context.sent;


            expect(_infer.inferTitle).toHaveBeenCalledTimes(0);
            expect(result).toBe(params.name);

          case 5:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  test('it should call sanitize filename', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _name2.default)(params);

          case 2:
            result = _context2.sent;

            expect(_utils.sanitizeFilename).toHaveBeenCalledWith(params.platform, result);

          case 4:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));
});

describe('bad name parameters', function () {
  beforeEach(function () {
    _infer.inferTitle.mockImplementationOnce(function () {
      return Promise.resolve(mockedResult);
    });
  });

  var params = { targetUrl: 'some url' };
  describe('when the name is undefined', function () {
    test('it should call inferTitle', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return (0, _name2.default)(params);

            case 2:
              expect(_infer.inferTitle).toHaveBeenCalledWith(params.targetUrl);

            case 3:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));
  });

  describe('when the name is an empty string', function () {
    test('it should call inferTitle', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var testParams;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              testParams = _extends({}, params, {
                name: ''
              });
              _context4.next = 3;
              return (0, _name2.default)(testParams);

            case 3:
              expect(_infer.inferTitle).toHaveBeenCalledWith(params.targetUrl);

            case 4:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    })));
  });

  test('it should call sanitize filename', function () {
    return (0, _name2.default)(params).then(function (result) {
      expect(_utils.sanitizeFilename).toHaveBeenCalledWith(params.platform, result);
    });
  });
});

describe('handling inferTitle results', function () {
  var params = { targetUrl: 'some url', name: '', platform: 'something' };
  test('it should return the result from inferTitle', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
    var result;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _infer.inferTitle.mockImplementationOnce(function () {
              return Promise.resolve(mockedResult);
            });

            _context5.next = 3;
            return (0, _name2.default)(params);

          case 3:
            result = _context5.sent;

            expect(result).toBe(mockedResult);
            expect(_infer.inferTitle).toHaveBeenCalledWith(params.targetUrl);

          case 6:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, undefined);
  })));

  describe('when the returned pageTitle is falsey', function () {
    test('it should return the default app name', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var result;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _infer.inferTitle.mockImplementationOnce(function () {
                return Promise.resolve(null);
              });

              _context6.next = 3;
              return (0, _name2.default)(params);

            case 3:
              result = _context6.sent;

              expect(result).toBe(_constants.DEFAULT_APP_NAME);
              expect(_infer.inferTitle).toHaveBeenCalledWith(params.targetUrl);

            case 6:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, undefined);
    })));
  });

  describe('when inferTitle resolves with an error', function () {
    test('it should return the default app name', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var result;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _infer.inferTitle.mockImplementationOnce(function () {
                return Promise.reject(new Error('some error'));
              });

              _context7.next = 3;
              return (0, _name2.default)(params);

            case 3:
              result = _context7.sent;

              expect(result).toBe(_constants.DEFAULT_APP_NAME);
              expect(_infer.inferTitle).toHaveBeenCalledWith(params.targetUrl);
              expect(_loglevel2.default.warn).toHaveBeenCalledTimes(1);

            case 7:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, undefined);
    })));
  });
});
//# sourceMappingURL=name.test.js.map
