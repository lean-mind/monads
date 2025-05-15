import { Monad } from '../monad';
import { Futurizable } from '../futurizable';
import { Future } from '../future';
import { Folding, Railway } from '../railway';

type FoldingTry<T, U> = Folding<'Try', T, Error, U>;

/**
 * Abstract class representing a computation that may either result in a value or an error.
 * @template T The type of the value.
 */
abstract class Try<T> implements Monad<T>, Futurizable<T>, Railway<T, Error> {
  /**
   * Executes a function and returns a `Try` instance.
   * @template T The type of the value.
   * @param {() => T} executable The function to execute.
   * @returns {Try<T>} A `Success` instance if the function executes without error, otherwise a `Failure` instance.
   * @example
   * const result = Try.execute(() => JSON.parse('{"key": "value"}'));
   * result.fold({ ifSuccess: console.log, ifFailure: error => console.error(error.message) }); // { key: 'value' }
   */
  static execute<T>(executable: () => T): Try<T> {
    try {
      return new Success(executable());
    } catch (error) {
      return new Failure(error as Error);
    }
  }

  /**
   * Creates a `Success` instance.
   * @template T The type of the value.
   * @param {T} value The value of the successful computation.
   * @returns {Success<T>} A `Success` instance containing the value.
   * @example
   * const success = Try.success(5);
   * success.fold({ ifSuccess: console.log, ifFailure: error => console.error(error.message) }); // 5
   */
  static success<T>(value: T): Try<T> {
    return new Success(value);
  }

  /**
   * Creates a `Failure` instance.
   * @template T The type of the value.
   * @param {Error} error The error of the failed computation.
   * @returns {Failure<T>} A `Failure` instance containing the error.
   * @example
   * const failure = Try.failure(new Error('An error occurred'));
   * failure.fold({ ifSuccess: console.log, ifFailure: error => console.error(error.message) }); // An error occurred
   */
  static failure<T>(error: Error): Try<T> {
    return new Failure(error);
  }

  /**
   * Creates a `Try` instance from a `Foldable` instance.
   * @template T The type of the value.
   * @param {Railway<T, unknown>} foldable The foldable instance.
   * @returns {Try<T>} A `Success` instance if the foldable contains a value, otherwise a `Failure` instance.
   * @example
   * const some = Option.of(5);
   * const success = Try.from(some);
   * success.fold({ ifSuccess: console.log, ifFailure: error => console.error(error.message) }); // 5
   *
   * const none = Option.of(undefined);
   * const failure = Try.from(none);
   * failure.fold({ ifSuccess: console.log, ifFailure: error => console.error(error.message) }); // Empty value
   */
  static from<T>(foldable: Railway<T, unknown>): Try<T> {
    return foldable.fold<Try<T>>({
      ifSuccess: (value: T) => Try.success(value),
      ifFailure: (error: unknown) => Try.failure<T>(error as Error),
      ifSome: (value: T) => Try.success(value),
      ifNone: () => Try.failure<T>(new Error('Empty value')),
      ifRight: (value: T) => Try.success(value),
      ifLeft: (value: unknown) => Try.failure<T>(new Error('Left value: ' + value)),
    });
  }

  /**
   * Transforms the value contained in this `Try` instance.
   * @template T The type of the value.
   * @template U The type of the transformed value.
   * @param {(value: T) => U} transform The transformation function.
   * @returns {Try<U>} A new `Try` instance containing the transformed value.
   * @example
   * const result = Try.execute(() => 5).map(value => value * 2);
   * result.fold({ ifSuccess: console.log, ifFailure: error => console.error(error.message) }); // 10
   */
  abstract map<U>(transform: (value: T) => U): Try<U>;

  /**
   * Transforms the value contained in this `Try` instance into another `Try` instance.
   * @template T The type of the value.
   * @template U The type of the transformed value.
   * @param {(value: T) => Try<U>} transform The transformation function.
   * @returns {Try<U>} The result of the transformation function.
   * @example
   * const result = Try.execute(() => 5).flatMap(value => Try.execute(() => value * 2));
   * result.fold({ ifSuccess: console.log, ifFailure: error => console.error(error.message) }); // 10
   */
  abstract flatMap<U>(transform: (value: T) => Try<U>): Try<U>;

  /**
   * Executes an action if this is a `Success` instance.
   * @template T The type of the value.
   * @param {(r: T) => void} action The action to execute if this is a `Success` instance.
   * @returns {Try<T>} The current `Try` instance.
   * @example
   * const result = Try.execute(() => 5).onSuccess(value => console.log(value)); // 5
   */
  abstract onSuccess(action: (value: T) => void): Try<T>;

  /**
   * Executes an action if this is a `Failure` instance.
   * @template T The type of the value.
   * @param {(error: Error) => void} action The action to execute if this is a `Failure` instance.
   * @returns {Try<T>} The current `Try` instance.
   * @example
   * const result = Try.execute(() => { throw new Error('failure'); }).onFailure(error => console.error(error.message)); // failure
   */
  abstract onFailure(action: (error: Error) => void): Try<T>;

  /**
   * Transforms a `Success` into another `Try` instance.
   * @template T The type of the value.
   * @template R The type of the transformed value.
   * @param {(value: T) => Try<R>} transform The transformation function.
   * @returns {Try<R>} The result of the transformation function.
   * @example
   * const result = Try.execute(() => 5).andThen(value => Try.execute(() => value * 2));
   * result.fold({ ifSuccess: console.log, ifFailure: error => console.error(error.message) }); // 10
   */
  abstract andThen<R>(transform: (value: T) => Try<R>): Try<R>;

  /**
   * Transforms a `Failure` into another `Try` instance.
   * @template T The type of the value.
   * @template R The type of the transformed value.
   * @param {(error: Error) => Try<R>} transform The transformation function.
   * @returns {Try<R>} The result of the transformation function.
   * @example
   * const result = Try.execute(() => { throw new Error('failure'); }).orElse(error => Try.execute(() => 0));
   * result.fold({ ifSuccess: console.log, ifFailure: error => console.error(error.message) }); // 0
   */
  abstract orElse(transform: (error: Error) => Try<T>): Try<T>;

  /**
   * Combines this `Try` instance with another `Railway` instance.
   * @template T The type of the value.
   * @template U The types of the combined value.
   * @param {Try<unknown>[]} others The other `Try` instances to combine with.
   * @returns {Try<[T, ...U]>} A new `Try` instance containing the combined values.
   * @example
   * const result = Try.execute(() => 5).combineWith([Try.success(10), Try.success(15)]);
   * result.fold({ ifSuccess: console.log, ifFailure: error => console.error(error.message) }); // [5, 10, 15]
   */
  abstract combineWith<U extends unknown[]>(others: Try<unknown>[]): Try<[T, ...U]>;

  /**
   * Unwraps the value contained in this `Try` instance by applying the appropriate handler for both Success and Failure cases.
   * @template T The type of the value.
   * @template U The type of the result.
   * @param {FoldingTry<T, U>} folding The folding object containing the functions to call for each case.
   * @returns {U} The result of the folding function.
   * @example
   * const result = Try.success(5);
   * result.fold({ ifSuccess: console.log, ifFailure: (error) => console.error(error.message) }); // 5
   */
  abstract fold<U>(folding: FoldingTry<T, U>): U;

  /**
   * Checks if this is a `Success` instance.
   * @returns {boolean} `true` if this is a `Success` instance, otherwise `false`.
   * @example
   * const result = Try.execute(() => 5);
   * result.isSuccess(); // true
   */
  abstract isSuccess(): this is Success<T>;

  /**
   * Checks if this is a `Failure` instance.
   * @returns {boolean} `true` if this is a `Failure` instance, otherwise `false`.
   * @example
   * const result = Try.execute(() => { throw new Error('failure'); });
   * result.isFailure(); // true
   */
  abstract isFailure(): this is Failure<T>;

  /**
   * Retrieves the value contained in this `Try` instance or a default value if this is a `Failure` instance.
   * @param {T} value The default value to return if this is a `Failure` instance.
   * @returns {T} The value contained in this `Try` instance or the default value.
   * @example
   * const result = Try.execute(() => 5);
   * console.log(result.getOrElse(0)); // 5
   *
   * const failure = Try.execute(() => { throw new Error('failure'); });
   * failure.getOrElse(0); // 0
   */
  abstract getOrElse(value: T): T;

  /**
   * Retrieves the value contained in this `Try` instance.
   * @returns {T} The value contained in this `Try` instance.
   * @throws {Error} If this is a `Failure` instance.
   * @example
   * const result = Try.execute(() => 5);
   * console.log(result.getOrThrow()); // 5
   *
   * const failure = Try.execute(() => { throw new Error('failure'); });
   * failure.getOrThrow(); // Error: failure
   */
  abstract getOrThrow(): T;

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

  onSuccess(action: (value: T) => void): Try<T> {
    action(this.value);
    return this;
  }

  onFailure(_: (error: Error) => void): Try<T> {
    return this;
  }

  andThen<R>(transform: (value: T) => Try<R>): Try<R> {
    return transform(this.value);
  }

  orElse(_: (error: Error) => Try<T>): Try<T> {
    return new Success(this.value);
  }

  combineWith<U extends unknown[]>(others: Try<unknown>[]): Try<[T, ...U]> {
    type UnwrapResult = { success: boolean; value: unknown | Error };
    const isUnsuccessful = (result: UnwrapResult): result is { success: false; value: Error } => !result.success;
    const values: unknown[] = [this.value];
    for (const other of others) {
      const result = other.fold<UnwrapResult>({
        ifSuccess: (val) => ({ success: true, value: val }),
        ifFailure: (err) => ({ success: false, value: err }),
      });
      if (isUnsuccessful(result)) {
        return Try.failure(result.value);
      }
      values.push(result.value);
    }

    return Try.success(values as [T, ...U]);
  }

  fold<U>(folding: FoldingTry<T, U>): U {
    return folding.ifSuccess(this.value);
  }

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<T> {
    return false;
  }

  getOrElse(_: T): T {
    return this.value;
  }

  getOrThrow(): T {
    return this.value;
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

  map(_: (_: never) => never): Try<never> {
    return new Failure(this.error);
  }

  flatMap(_: (_: never) => Try<never>): Try<never> {
    return new Failure(this.error);
  }

  onSuccess(_: (value: T) => void): Try<T> {
    return this;
  }

  onFailure(action: (error: Error) => void): Try<T> {
    action(this.error);
    return this;
  }

  andThen<U>(_: (value: T) => Try<U>): Try<U> {
    return new Failure(this.error);
  }

  orElse(transform: (error: Error) => Try<T>): Try<T> {
    return transform(this.error);
  }

  combineWith<U extends unknown[]>(_: Try<unknown>[]): Try<[T, ...U]> {
    return new Failure(this.error);
  }

  fold<U>(folding: FoldingTry<T, U>): U {
    return folding.ifFailure(this.error);
  }

  isSuccess(): this is Success<T> {
    return false;
  }

  isFailure(): this is Failure<T> {
    return true;
  }

  getOrElse(value: T): T {
    return value;
  }

  getOrThrow(): T {
    throw this.error;
  }

  toFuture(): Future<T> {
    return Future.of(() => Promise.reject(this.error));
  }
}

export { Try, Success, Failure };
