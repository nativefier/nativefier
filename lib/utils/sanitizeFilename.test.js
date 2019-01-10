'use strict';

var _sanitizeFilename = require('sanitize-filename');

var _sanitizeFilename2 = _interopRequireDefault(_sanitizeFilename);

var _sanitizeFilename3 = require('./sanitizeFilename');

var _sanitizeFilename4 = _interopRequireDefault(_sanitizeFilename3);

var _constants = require('../constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock('sanitize-filename');
_sanitizeFilename2.default.mockImplementation(function (str) {
  return str;
});

test('it should call the sanitize-filename npm module', function () {
  var param = 'abc';
  (0, _sanitizeFilename4.default)('', param);
  expect(_sanitizeFilename2.default).toHaveBeenCalledWith(param);
});

describe('replacing non ascii characters', function () {
  var nonAscii = '�';
  test('it should return a result without non ascii characters', function () {
    var param = `${nonAscii}abc`;
    var expectedResult = 'abc';
    var result = (0, _sanitizeFilename4.default)('', param);
    expect(result).toBe(expectedResult);
  });

  describe('when the result of replacing these characters is empty', function () {
    var result = (0, _sanitizeFilename4.default)('', nonAscii);
    expect(result).toBe(_constants.DEFAULT_APP_NAME);
  });
});

describe('when the platform is linux', function () {
  test('it should return a kebab cased name', function () {
    var param = 'some name';
    var expectedResult = 'some-name';
    var result = (0, _sanitizeFilename4.default)('linux', param);
    expect(result).toBe(expectedResult);
  });
});
//# sourceMappingURL=sanitizeFilename.test.js.map
