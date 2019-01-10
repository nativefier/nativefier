'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  var tasks = (0, _fields2.default)(options);
  return Promise.all(tasks).then(function (fieldResults) {
    return inferredOptions(options, fieldResults);
  });
};

var _fields = require('./fields');

var _fields2 = _interopRequireDefault(_fields);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function resultArrayToObject(fieldResults) {
  return fieldResults.reduce(function (accumulator, value) {
    return Object.assign({}, accumulator, value);
  }, {});
}

function inferredOptions(oldOptions, fieldResults) {
  var newOptions = resultArrayToObject(fieldResults);
  return Object.assign({}, oldOptions, newOptions);
}

// Takes the options object and infers new values
// which may need async work
//# sourceMappingURL=asyncConfig.js.map
