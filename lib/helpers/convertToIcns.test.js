'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _convertToIcns = require('./convertToIcns');

var _convertToIcns2 = _interopRequireDefault(_convertToIcns);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// Prerequisite for test: to use OSX with sips, iconutil and imagemagick convert

function testConvertPng(pngName) {
  if (_os2.default.platform() !== 'darwin') {
    // Skip png conversion tests, OSX is required
    return Promise.resolve();
  }

  return new Promise(function (resolve, reject) {
    return (0, _convertToIcns2.default)(_path2.default.join(__dirname, '../../', 'test-resources', pngName), function (error, icnsPath) {
      if (error) {
        reject(error);
        return;
      }

      var stat = _fs2.default.statSync(icnsPath);

      expect(stat.isFile()).toBe(true);
      resolve();
    });
  });
}

describe('Get Icon Module', function () {
  test('Can convert a rgb png to icns', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return testConvertPng('iconSample.png');

          case 2:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  test('Can convert a grey png to icns', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return testConvertPng('iconSampleGrey.png');

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));
});
//# sourceMappingURL=convertToIcns.test.js.map
