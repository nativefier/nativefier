'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (options) {
  return fields.map(function (_ref) {
    var field = _ref.field,
        task = _ref.task;
    return wrap(field, task, options);
  });
};

var _icon = require('./icon');

var _icon2 = _interopRequireDefault(_icon);

var _userAgent = require('./userAgent');

var _userAgent2 = _interopRequireDefault(_userAgent);

var _name = require('./name');

var _name2 = _interopRequireDefault(_name);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fields = [{
  field: 'userAgent',
  task: _userAgent2.default
}, {
  field: 'icon',
  task: _icon2.default
}, {
  field: 'name',
  task: _name2.default
}];

// Modifies the result of each promise from a scalar
// value to a object containing its fieldname
function wrap(fieldName, promise, args) {
  return promise(args).then(function (result) {
    return {
      [fieldName]: result
    };
  });
}

// Returns a list of promises which will all resolve
// with the following result: {[fieldName]: fieldvalue}
//# sourceMappingURL=index.js.map
