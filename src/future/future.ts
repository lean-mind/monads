import { Monad } from '../monad';
import { Completable } from '../complete';

/**
 * Description placeholder
 *
 * @class Future
 * @typedef {Future}
 * @template T
 * @implements {Monad<T>}
 * @implements {Completable<T>}
 */
class Future<T> implements Monad<T>, Completable<T> {
  
  /**
   * Creates an instance of Future.
   *
   * @constructor
   * @private
   * @param {() => Promise<T>} action
   */
  private constructor(private readonly action: () => Promise<T>) {}

  static of<T>(action: () => Promise<T>): Future<T> {
    return new Future(action);
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => U} transform
   * @returns {Future<U>}
   */
  map<U>(transform: (value: T) => U): Future<U> {
    return new Future<U>(() => this.action().then(transform));
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => Future<U>} transform
   * @returns {Future<U>}
   */
  flatMap<U>(transform: (value: T) => Future<U>): Future<U> {
    return new Future<U>(() => this.action().then((value) => transform(value).action()));
  }
  
  /**
   * Description placeholder
   *
   * @template S
   * @param {(value: T) => S} onSuccess
   * @param {(error: Error) => S} onFailure
   * @returns {Promise<S>}
   */
  complete<S>(onSuccess: (value: T) => S, onFailure: (error: Error) => S): Promise<S> {
    return this.action().then(onSuccess).catch(onFailure);
  }
}

export { Future };
