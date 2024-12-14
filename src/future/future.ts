import { Monad } from '../monad';

/**
 * Class representing a future computation that will produce a value or an error.
 * @template T The type of the value produced by the future computation.
 */
class Future<T> implements Monad<T> {
  /**
   * Creates a new `Future` instance.
   * @param {() => Promise<T>} action The asynchronous action to be performed.
   * @private
   */
  private constructor(private readonly action: () => Promise<T>) {}

  /**
   * Creates a `Future` instance from an asynchronous action.
   * @template T The type of the value produced by the future computation.
   * @param {() => Promise<T>} action The asynchronous action to be performed.
   * @returns {Future<T>} A new `Future` instance.
   * @example
   * const future = Future.of(() => Promise.resolve(5));
   * future.complete(console.log, error => console.error(error.message)); // 5
   */
  static of<T>(action: () => Promise<T>): Future<T> {
    return new Future(action);
  }

  /**
   * Transforms the value produced by this `Future` instance.
   * @template U The type of the transformed value.
   * @param {(value: T) => U} transform The transformation function.
   * @returns {Future<U>} A new `Future` instance containing the transformed value.
   * @example
   * const future = Future.of(() => Promise.resolve(5)).map(value => value * 2);
   * future.complete(console.log, error => console.error(error.message)); // 10
   */
  map<U>(transform: (value: T) => U): Future<U> {
    return new Future<U>(() => this.action().then(transform));
  }

  /**
   * Transforms the value produced by this `Future` instance into another `Future` instance.
   * @template U The type of the transformed value.
   * @param {(value: T) => Future<U>} transform The transformation function.
   * @returns {Future<U>} A new `Future` instance containing the transformed value.
   * @example
   * const future = Future.of(() => Promise.resolve(5)).flatMap(value => Future.of(() => Promise.resolve(value * 2)));
   * future.complete(console.log, error => console.error(error.message)); // 10
   */
  flatMap<U>(transform: (value: T) => Future<U>): Future<U> {
    return new Future<U>(() => this.action().then((value) => transform(value).action()));
  }

  /**
   * Completes the future computation by executing the provided success or failure handlers.
   * @template S The type of the result produced by the handlers.
   * @param {(value: T) => S} onSuccess The function to call if the computation succeeds.
   * @param {(error: Error) => S} onFailure The function to call if the computation fails.
   * @returns {Promise<S>} A promise that resolves to the result of the handlers.
   * @example
   * const future = Future.of(() => Promise.resolve(5));
   * future.complete(console.log, error => console.error(error.message)); // 5
   */
  complete<S>(onSuccess: (value: T) => S, onFailure: (error: Error) => S): Promise<S> {
    return this.action().then(onSuccess).catch(onFailure);
  }
}

export { Future };
