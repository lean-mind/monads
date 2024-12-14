import { Monad } from '../monad';
import { Matchable } from '../match';
import { Futurizable } from "../futurizable";
import { Future } from '../future';

/**
 * Abstract class representing a computation that may either result in a value or an error.
 * @template T The type of the value.
 */
abstract class Try<T> implements Monad<T>, Matchable<T, Error>, Futurizable<T> {

  /**
   * Executes a function and returns a `Try` instance.
   * @template T The type of the value.
   * @param {() => T} executable The function to execute.
   * @returns {Try<T>} A `Success` instance if the function executes without error, otherwise a `Failure` instance.
   * @example
   * const result = Try.execute(() => JSON.parse('{"key": "value"}'));
   * result.match(console.log, error => console.error(error.message)); // { key: 'value' }
   */
  static execute<T>(executable: () => T): Try<T> {
    try {
      return new Success(executable());
    } catch (error) {
      return new Failure(error as Error);
    }
  }

  /**
   * Creates a `Try` instance from a `Matchable` instance.
   * @template T The type of the value.
   * @param {Matchable<T, unknown>} matchable The matchable instance.
   * @returns {Try<T>} A `Success` instance if the matchable contains a value, otherwise a `Failure` instance.
   * @example
   * const some = Option.of(5);
   * const success = Try.from(some);
   * sucess.match(console.log, error => console.error(error.message)); // 5
   *
   * const none = Option.of(undefined);
   * const failure = Try.from(none);
   * failure.match(console.log, error => console.error(error.message)); // "No error provided"
   */
  static from<T>(matchable: Matchable<T, unknown>): Try<T> {
    return matchable.match<Try<T>>(
      (value: T) => new Success(value),
      (error: unknown) => (error instanceof Error ? new Failure(error) : new Failure(new Error('No error provided')))
    );
  }

  /**
   * Transforms the value contained in this `Try` instance.
   * @template U The type of the transformed value.
   * @param {(value: T) => U} transform The transformation function.
   * @returns {Try<U>} A new `Try` instance containing the transformed value.
   * @example
   * const result = Try.execute(() => 5).map(value => value * 2);
   * result.match(console.log, error => console.error(error.message)); // 10
   */
  abstract map<U>(transform: (value: T) => U): Try<U>;

  /**
   * Transforms the value contained in this `Try` instance into another `Try` instance.
   * @template U The type of the transformed value.
   * @param {(value: T) => Try<U>} transform The transformation function.
   * @returns {Try<U>} The result of the transformation function.
   * @example
   * const result = Try.execute(() => 5).flatMap(value => Try.execute(() => value * 2));
   * result.match(console.log, error => console.error(error.message)); // 10
   */
  abstract flatMap<U>(transform: (value: T) => Try<U>): Try<U>;

  /**
   * Unwraps the value contained in this `Try` instance by applying the appropriate handler for both Success and Failure cases.
   * @template U The type of the result.
   * @param {(value: T) => U} ifSuccess The function to call if this is a `Success` instance.
   * @param {(error: Error) => U} ifFailure The function to call if this is a `Failure` instance.
   * @returns {U} The result of the matching function.
   * @example
   * const result = Try.execute(() => JSON.parse('invalid json'));
   * result.match(console.log, error => console.error(error.message)); // Unexpected token i in JSON at position 0
   */
  abstract match<U>(ifSuccess: (value: T) => U, ifFailure: (error: Error) => U): U;

  /**
   * Checks if this is a `Success` instance.
   * @returns {boolean} `true` if this is a `Success` instance, otherwise `false`.
   * @example
   * const result = Try.execute(() => 5);
   * result.match(value => console.log(value.isSuccess()), error => console.error(error.message)); // true
   */
  abstract isSuccess(): this is Success<T>;

  /**
   * Checks if this is a `Failure` instance.
   * @returns {boolean} `true` if this is a `Failure` instance, otherwise `false`.
   * @example
   * const result = Try.execute(() => { throw new Error('failure'); });
   * result.match(console.log, error => console.error(error.isFailure()); // true
   */
  abstract isFailure(): this is Failure<T>;

  /**
   * Converts this `Try` instance into a `Future` instance.
   * @returns {Future<T>} A new `Future` instance.
   * @example
   * const result = Try.execute(() => 5);
   * const future = result.toFuture();
   * future.complete(console.log, console.error); // 5
   * @example
   * const result = Try.execute(() => { throw new Error('failure'); });
   * const future = result.toFuture();
   * future.complete(console.log, console.error); // Error: failure
   */
  abstract toFuture(): Future<T>;
}

/**
 * Class representing a successful computation.
 * @template T The type of the value.
 */
class Success<T> extends Try<T> {
  /**
   * Creates a new `Success` instance.
   * @param {T} value The value of the successful computation.
   */
  constructor(private value: T) {
    super();
  }

  map<U>(transform: (value: T) => U): Try<U> {
    return new Success(transform(this.value));
  }

  flatMap<U>(transform: (value: T) => Try<U>): Try<U> {
    return transform(this.value);
  }

  match<U>(ifSuccess: (value: T) => U, _: (_: never) => U): U {
    return ifSuccess(this.value);
  }

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<T> {
    return false;
  }

  toFuture(): Future<T> {
    return Future.of(() => Promise.resolve(this.value));
  }
}

/**
 * Class representing a failed computation.
 * @template T The type of the value.
 */
class Failure<T = Error> extends Try<T> {
  /**
   * Creates a new `Failure` instance.
   * @param {Error} error The error of the failed computation.
   */
  constructor(private error: Error) {
    super();
  }

  /**
   * A static instance representing a failure with no error provided.
   * @type {Failure<never>}
   */

  map(_: (_: never) => never): Try<never> {
    return new Failure(this.error);
  }

  flatMap(_: (_: never) => Try<never>): Try<never> {
    return new Failure(this.error);
  }

  match<U>(_: (_: never) => never, ifFailure: (error: Error) => U): U {
    return ifFailure(this.error);
  }

  isSuccess(): this is Success<T> {
    return false;
  }

  isFailure(): this is Failure<T> {
    return true;
  }

  toFuture(): Future<T> {
    return Future.of(() => Promise.reject(this.error));
  }
}

export { Try, Success, Failure };
