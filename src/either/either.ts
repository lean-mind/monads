import { Monad } from '../monad';
import { Matchable } from '../match';
import { Future } from '../future';
import { Futurizable } from '../futurizable';

/**
 * Abstract class representing a value that can be one of two possible types.
 * @template L The type of the left value.
 * @template R The type of the right value.
 */
abstract class Either<L, R> implements Monad<R>, Matchable<R, L>, Futurizable<R> {
  /**
   * Creates a `Right` instance.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @param {R} value The right value.
   * @returns {Either<L, R>} A `Right` instance containing the value.
   * @example
   * const right = Either.right(5);
   * right.match(console.log, error => console.error(error.message)); // 5
   */
  static right<L, R>(value: R): Either<L, R> {
    return new Right(value);
  }

  /**
   * Creates a `Left` instance.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @param {L} value The left value.
   * @returns {Either<L, R>} A `Left` instance containing the value.
   * @example
   * const left = Either.left('error');
   * left.match(console.log, error => console.error(error.message)); // 'error'
   */
  static left<L, R>(value: L): Either<L, R> {
    return new Left(value);
  }

  /**
   * Creates an `Either` instance from a `Matchable` instance.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @param {Matchable<R, L>} matchable The matchable instance.
   * @returns {Either<L, R>} A `Right` instance if the matchable contains a right value, otherwise a `Left` instance.
   * @example
   * const option = Option.of(5);
   * const either = Either.from(option);
   * either.match(console.log, error => console.error(error.message)); // 5
   */
  static from<L, R>(matchable: Matchable<R, L>): Either<L, R> {
    return matchable.match(
      (value: R) => Either.right(value),
      (value: L) => Either.left(value)
    );
  }

  /**
   * Executes a function and returns an `Either` instance that can raise an Error.
   * @template T The type of the right value.
   * @param {() => T} execute The function to execute.
   * @returns {Either<Error, T>} A `Right` instance if the function executes without error, otherwise a `Left` instance.
   * @example
   * const result = Either.catch(() => JSON.parse('invalid json'));
   * result.match(console.log, error => console.error(error.message)); // 'SyntaxError: Unexpected token i in JSON at position 0'
   */
  static catch<T>(execute: () => T): Either<Error, T> {
    try {
      return Either.right(execute());
    } catch (error) {
      return error instanceof Error ? Either.left(error) : Either.left(new Error('Unknown error'));
    }
  }

  /**
   * Transforms the right value contained in this `Either` instance.
   * @template R The type of the right value.
   * @template T The type of the transformed value.
   * @param {(r: R) => T} transform The transformation function.
   * @returns {Either<L, T>} A new `Either` instance containing the transformed value.
   * @example
   * const result = Either.right(5).map(value => value * 2);
   * result.match(console.log, console.error); // 10
   */
  abstract map<T>(transform: (r: R) => T): Either<L, T>;

  /**
   * Transforms the left value contained in this `Either` instance.
   * @template L The type of the left value.
   * @template T The type of the transformed value.
   * @template R The type of the right value.
   * @param {(l: L) => T} transform The transformation function.
   * @returns {Either<T, R>} A new `Either` instance containing the transformed value.
   * @example
   * const result = Either.left('error').mapLeft(value => `Error: ${value}`);
   * result.match(console.log, console.error); // 'Error: error'
   */
  abstract mapLeft<T>(transform: (l: L) => T): Either<T, R>;

  /**
   * Transforms the right value contained in this `Either` instance into another `Either` instance.
   * @template R The type of the right value.
   * @template T The type of the transformed value.
   * @param {(r: R) => Either<L, T>} transform The transformation function.
   * @returns {Either<L, T>} The result of the transformation function.
   * @example
   * const result = Either.right(5).flatMap(value => Either.right(value * 2));
   * result.match(console.log, console.error); // 10
   */
  abstract flatMap<T>(transform: (r: R) => Either<L, T>): Either<L, T>;

  /**
   * Transforms the left value contained in this `Either` instance into another `Either` instance.
   * @template L The type of the left value.
   * @template T The type of the transformed value.
   * @template R The type of the right value.
   * @param {(l: L) => Either<T, R>} transform The transformation function.
   * @returns {Either<T, R>} The result of the transformation function.
   * @example
   * const result = Either.left('error').flatMapLeft(value => Either.left(`Error: ${value}`));
   * result.match(console.log, console.error); // Error: error
   */
  abstract flatMapLeft<T>(transform: (l: L) => Either<T, R>): Either<T, R>;

  /**
   * Recovers from an error by transforming the left value into a right value.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @template T The type of the new left value.
   * @param {(l: L) => Either<T, R>} transform The transformation function.
   * @returns {Either<T, R>} A new `Either` instance containing the transformed value.
   * @example
   * const result = Either.left('error').recover(value => Either.right(`Recovered: ${value}`));
   * result.match(console.log, console.error); // Recovered: error
   */
  abstract recover<T>(transform: (l: L) => Either<T, R>): Either<T, R>;

  /**
   * Executes an action if this is a `Right` instance.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @param {(r: R) => void} action The action to execute if this is a `Right` instance.
   * @returns {Either<L, R>} The current `Either` instance.
   * @example
   * const result = Either.right(5).onRight(value => console.log(value)); // prints 5
   */
  abstract onRight(action: (r: R) => void): Either<L, R>;

  /**
   * Executes an action if this is a `Left` instance.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @param {(l: L) => void} action The action to execute if this is a `Left` instance.
   * @returns {Either<L, R>} The current `Either` instance.
   * @example
   * const result = Either.left('error').onLeft(value => console.error(value)); // prints 'error'
   */
  abstract onLeft(action: (l: L) => void): Either<L, R>;

  /**
   * Unwraps the value contained in this `Either` instance by applying the appropriate handler for both Left and Right cases.
   * @template R The type of the right value.
   * @template L The type of the left value.
   * @template T The type of the result.
   * @param {(r: R) => T} ifRight The function to call if this is a `Right` instance.
   * @param {(l: L) => T} ifLeft The function to call if this is a `Left` instance.
   * @returns {T} The result of the matching function.
   * @example
   * const result = Either.right(5);
   * result.match(console.log, console.error); // 5
   */
  abstract match<T>(ifRight: (r: R) => T, ifLeft: (l: L) => T): T;

  /**
   * Checks if this is a `Left` instance.
   * @returns {boolean} `true` if this is a `Left` instance, otherwise `false`.
   * @example
   * const result = Either.left('error');
   * console.log(result.isLeft()); // true
   */
  abstract isLeft(): this is Left<L, R>;

  /**
   * Checks if this is a `Right` instance.
   * @returns {boolean} `true` if this is a `Right` instance, otherwise `false`.
   * @example
   * const result = Either.right(5);
   * console.log(result.isRight()); // true
   */
  abstract isRight(): this is Right<L, R>;

  /**
   * Converts this `Either` instance into a `Future` instance.
   * @returns {Future<R>} A `Future` instance containing the value.
   * @example
   * const either = Either.right(5);
   * const future = either.toFuture();
   * asyncEither.complete(console.log, console.error); // 5
   * @example
   * const either = Either.left('error');
   * const future = either.toFuture();
   * asyncEither.complete(console.log, console.error); // Error: error
   */
  abstract toFuture(): Future<R>;
}

/**
 * Class representing a left value.
 * @template L The type of the left value.
 * @template R The type of the right value.
 */
class Left<L, R> extends Either<L, R> {
  /**
   * Creates a new `Left` instance.
   * @param {L} value The left value.
   */
  constructor(private value: L) {
    super();
  }

  map<T>(_: (r: R) => T): Either<L, T> {
    return new Left(this.value);
  }

  mapLeft<T>(transform: (l: L) => T): Either<T, never> {
    return new Left(transform(this.value));
  }

  flatMap<T>(_: (r: R) => Either<L, T>): Either<L, T> {
    return new Left(this.value);
  }

  flatMapLeft<T>(transform: (l: L) => Either<T, never>): Either<T, never> {
    return transform(this.value);
  }

  recover<T>(transform: (l: L) => Either<T, never>): Either<T, never> {
    return transform(this.value);
  }

  onRight(_: (r: R) => void): Either<L, R> {
    return this;
  }

  onLeft(action: (l: L) => void): Either<L, R> {
    action(this.value);
    return this;
  }

  match<T>(_: (_: R) => T, ifLeft: (l: L) => T): T {
    return ifLeft(this.value);
  }

  isLeft(): this is Left<L, never> {
    return true;
  }

  isRight(): this is Right<L, never> {
    return false;
  }

  toFuture(): Future<never> {
    return Future.of(() => Promise.reject(new Error(this.value?.toString() ?? 'Unknown error')));
  }
}

/**
 * Class representing a right value.
 * @template L The type of the left value.
 * @template R The type of the right value.
 */
class Right<L, R> extends Either<L, R> {
  /**
   * Creates a new `Right` instance.
   * @param {R} value The right value.
   */
  constructor(private value: R) {
    super();
  }

  map<T>(transform: (r: R) => T): Either<never, T> {
    return new Right(transform(this.value));
  }

  mapLeft<T>(_: (l: L) => T): Either<T, R> {
    return new Right(this.value);
  }

  flatMap<T>(transform: (r: R) => Either<never, T>): Either<never, T> {
    return transform(this.value);
  }

  flatMapLeft<T>(_: (l: L) => Either<T, R>): Either<T, R> {
    return new Right(this.value);
  }

  recover<T>(_: (l: L) => Either<T, R>): Either<T, R> {
    return new Right(this.value);
  }

  onRight(action: (r: R) => void): Either<L, R> {
    action(this.value);
    return this;
  }

  onLeft(_: (l: L) => void): Either<L, R> {
    return this;
  }

  match<T>(ifRight: (r: R) => T, _: (_: L) => T): T {
    return ifRight(this.value);
  }

  isLeft(): this is Left<never, R> {
    return false;
  }

  isRight(): this is Right<never, R> {
    return true;
  }

  toFuture(): Future<R> {
    return Future.of(() => Promise.resolve(this.value));
  }
}

export { Either, Right, Left };
