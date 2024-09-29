import { Monad } from '../monad';
import { Matchable } from '../match';

/**
 * Description placeholder
 *
 * @abstract
 * @class Try
 * @typedef {Try}
 * @template T
 * @implements {Monad<T>}
 * @implements {Matchable<T, Error>}
 */
abstract class Try<T> implements Monad<T>, Matchable<T, Error> {
  
  /**
   * Description placeholder
   *
   * @static
   * @template T
   * @param {() => T} executable
   * @returns {Try<T>}
   */
  static execute<T>(executable: () => T): Try<T> {
    try {
      return new Success(executable());
    } catch (error) {
      return new Failure(error as Error);
    }
  }
  
  /**
   * Description placeholder
   *
   * @static
   * @template T
   * @param {Matchable<T, unknown>} matchable
   * @returns {Try<T>}
   */
  static from<T>(matchable: Matchable<T, unknown>): Try<T> {
    return matchable.match<Try<T>>(
      (value: T) => new Success(value),
      (error: unknown) => (error instanceof Error ? new Failure(error) : Failure.NO_ERROR_PROVIDED)
    );
  }
  
  /**
   * Description placeholder
   *
   * @abstract
   * @template U
   * @param {(value: T) => U} transform
   * @returns {Try<U>}
   */
  abstract map<U>(transform: (value: T) => U): Try<U>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @template U
   * @param {(value: T) => Try<U>} transform
   * @returns {Try<U>}
   */
  abstract flatMap<U>(transform: (value: T) => Try<U>): Try<U>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @template U
   * @param {(value: T) => U} ifSuccess
   * @param {(error: Error) => U} ifFailure
   * @returns {U}
   */
  abstract match<U>(ifSuccess: (value: T) => U, ifFailure: (error: Error) => U): U;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @returns {this is Success<T>}
   */
  abstract isSuccess(): this is Success<T>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @returns {this is Failure<T>}
   */
  abstract isFailure(): this is Failure<T>;
}

/**
 * Description placeholder
 *
 * @class Success
 * @typedef {Success}
 * @template T
 * @extends {Try<T>}
 */
class Success<T> extends Try<T> {
  
  /**
   * Creates an instance of Success.
   *
   * @constructor
   * @param {T} value
   */
  constructor(private value: T) {
    super();
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => U} transform
   * @returns {Try<U>}
   */
  map<U>(transform: (value: T) => U): Try<U> {
    return new Success(transform(this.value));
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => Try<U>} transform
   * @returns {Try<U>}
   */
  flatMap<U>(transform: (value: T) => Try<U>): Try<U> {
    return transform(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => U} ifSuccess
   * @param {(_: never) => U} _
   * @returns {U}
   */
  match<U>(ifSuccess: (value: T) => U, _: (_: never) => U): U {
    return ifSuccess(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @returns {this is Success<T>}
   */
  isSuccess(): this is Success<T> {
    return true;
  }
  
  /**
   * Description placeholder
   *
   * @returns {this is Failure<T>}
   */
  isFailure(): this is Failure<T> {
    return false;
  }
}

/**
 * Description placeholder
 *
 * @class Failure
 * @typedef {Failure}
 * @template T
 * @extends {Try<T>}
 */
class Failure<T> extends Try<T> {
  
  /**
   * Creates an instance of Failure.
   *
   * @constructor
   * @param {Error} error
   */
  constructor(private error: Error) {
    super();
  }
  
  /**
   * Description placeholder
   *
   * @static
   * @type {Failure<never>}
   */
  static NO_ERROR_PROVIDED = new Failure<never>(new Error('No error provided'));

  /**
   * Description placeholder
   *
   * @param {(_: never) => never} _
   * @returns {Try<never>}
   */
  map(_: (_: never) => never): Try<never> {
    return new Failure(this.error);
  }

  /**
   * Description placeholder
   *
   * @param {(_: never) => Try<never>} _
   * @returns {Try<never>}
   */
  flatMap(_: (_: never) => Try<never>): Try<never> {
    return new Failure(this.error);
  }

  /**
   * Description placeholder
   *
   * @template U
   * @param {(_: never) => never} _
   * @param {(error: Error) => U} ifFailure
   * @returns {U}
   */
  match<U>(_: (_: never) => never, ifFailure: (error: Error) => U): U {
    return ifFailure(this.error);
  }

  /**
   * Description placeholder
   *
   * @returns {this is Success<T>}
   */
  isSuccess(): this is Success<T> {
    return false;
  }

  /**
   * Description placeholder
   *
   * @returns {this is Failure<T>}
   */
  isFailure(): this is Failure<T> {
    return true;
  }
}

export { Try, Success, Failure };
