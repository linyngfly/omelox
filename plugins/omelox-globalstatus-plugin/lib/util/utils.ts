
export class utils {
  /**
 * Invoke callback with check
 */
  static invokeCallback(cb: Function) {
    if (!!cb && typeof cb === 'function') {
      cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
  }

  static size(obj: any) {
    let count = 0;
    for (let i in obj) {
      if (obj.hasOwnProperty(i) && typeof obj[i] !== 'function') {
        count++;
      }
    }
    return count;
  }
}
