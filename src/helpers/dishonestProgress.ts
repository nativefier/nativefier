import ProgressBar = require('progress'); // require-d because default-exports a function, which makes tsc complain and demand an `esModuleInterop` flag

export class DishonestProgress {
  private tickParts: number;

  private bar: ProgressBar;

  private tickingPrevious: {
    message: string;
    remainder: number;
    interval: null | NodeJS.Timeout;
  };

  constructor(total: number) {
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

  tick(message: string): void {
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
