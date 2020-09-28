
export class utils {
  /**
 * Invoke callback with check
 */
  static invokeCallback(cb: Function, ...args: any[]) {
    if (!!cb && typeof cb === 'function') {
      cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
  }

}
