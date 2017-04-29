import ProgressBar from 'progress';

class DishonestProgress {
  constructor(total) {
    this.tickParts = total * 10;

    this.bar = new ProgressBar('  :task [:bar] :percent', {
      complete: '=',
      incomplete: ' ',
      total: total * this.tickParts,
      width: 50,
      clear: true,
    });

    this.tickingPrevious = {
      message: '',
      remainder: 0,
      interval: null,
    };
  }

  tick(message) {
    const {
      remainder: prevRemainder,
      message: prevMessage,
      interval: prevInterval,
    } = this.tickingPrevious;

    if (prevRemainder) {
      this.bar.tick(prevRemainder, {
        task: prevMessage,
      });
      clearInterval(prevInterval);
    }

    const realRemainder = this.bar.total - this.bar.curr;
    if (realRemainder === this.tickParts) {
      this.bar.tick(this.tickParts, {
        task: message,
      });
      return;
    }

    this.bar.tick({
      task: message,
    });

    this.tickingPrevious = {
      message,
      remainder: this.tickParts,
      interval: null,
    };

    this.tickingPrevious.remainder -= 1;

    this.tickingPrevious.interval = setInterval(() => {
      if (this.tickingPrevious.remainder === 1) {
        clearInterval(this.tickingPrevious.interval);
        return;
      }

      this.bar.tick({
        task: message,
      });
      this.tickingPrevious.remainder -= 1;
    }, 200);
  }
}

export default DishonestProgress;
