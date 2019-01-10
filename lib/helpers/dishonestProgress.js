'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _progress = require('progress');

var _progress2 = _interopRequireDefault(_progress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DishonestProgress = function () {
  function DishonestProgress(total) {
    _classCallCheck(this, DishonestProgress);

    this.tickParts = total * 10;

    this.bar = new _progress2.default('  :task [:bar] :percent', {
      complete: '=',
      incomplete: ' ',
      total: total * this.tickParts,
      width: 50,
      clear: true
    });

    this.tickingPrevious = {
      message: '',
      remainder: 0,
      interval: null
    };
  }

  _createClass(DishonestProgress, [{
    key: 'tick',
    value: function tick(message) {
      var _this = this;

      var _tickingPrevious = this.tickingPrevious,
          prevRemainder = _tickingPrevious.remainder,
          prevMessage = _tickingPrevious.message,
          prevInterval = _tickingPrevious.interval;


      if (prevRemainder) {
        this.bar.tick(prevRemainder, {
          task: prevMessage
        });
        clearInterval(prevInterval);
      }

      var realRemainder = this.bar.total - this.bar.curr;
      if (realRemainder === this.tickParts) {
        this.bar.tick(this.tickParts, {
          task: message
        });
        return;
      }

      this.bar.tick({
        task: message
      });

      this.tickingPrevious = {
        message,
        remainder: this.tickParts,
        interval: null
      };

      this.tickingPrevious.remainder -= 1;

      this.tickingPrevious.interval = setInterval(function () {
        if (_this.tickingPrevious.remainder === 1) {
          clearInterval(_this.tickingPrevious.interval);
          return;
        }

        _this.bar.tick({
          task: message
        });
        _this.tickingPrevious.remainder -= 1;
      }, 200);
    }
  }]);

  return DishonestProgress;
}();

exports.default = DishonestProgress;
//# sourceMappingURL=dishonestProgress.js.map
