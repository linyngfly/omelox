/**
 * Count down to zero and invoke cb finally.
 */
class CountDownLatch {
  constructor(protected count: number, protected cb: Function) {
  }

  /**
   * Call when a task finish to count down.
   */
  done() {
    if (this.count <= 0) {
      throw new Error('illegal state.');
    }

    this.count--;
    if (this.count === 0) {
      this.cb();
    }
  }

}

/**
 * create a count down latch
 */
export const createCountDownLatch = function (count: number, cb: Function) {
  if (!count || count <= 0) {
    throw new Error('count should be positive.');
  }
  if (typeof cb !== 'function') {
    throw new Error('cb should be a function.');
  }

  return new CountDownLatch(count, cb);
};