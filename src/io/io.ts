import { Monad } from '../monad';


/**
 * Description placeholder
 *
 * @class IO
 * @typedef {IO}
 * @template T
 * @implements {Monad<T>}
 */
class IO<T> implements Monad<T> {
  
  /**
   * Creates an instance of IO.
   *
   * @constructor
   * @private
   * @param {() => T} description
   */
  private constructor(private description: () => T) {}
  
  /**
   * Description placeholder
   *
   * @static
   * @template T
   * @param {() => T} sideEffect
   * @returns {IO<T>}
   */
  static of<T>(sideEffect: () => T): IO<T> {
    return new IO(sideEffect);
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => IO<U>} transform
   * @returns {IO<U>}
   */
  flatMap<U>(transform: (value: T) => IO<U>): IO<U> {
    return new IO(() => transform(this.description()).runUnsafe());
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => U} transform
   * @returns {IO<U>}
   */
  map<U>(transform: (value: T) => U): IO<U> {
    return new IO(() => transform(this.description()));
  }
  
  /**
   * Description placeholder
   *
   * @returns {T}
   */
  runUnsafe(): T {
    return this.description();
  }
}

export { IO };
