import { Monad } from '../monad';
import { Matchable } from '../match';
import { Future } from '../future';
import { Futurizable } from '../future/futurizable';

/**
 * Abstract class representing a value that can be one of two possible types.
 * @template L The type of the left value.
 * @template R The type of the right value.
 */
abstract class Either<L, R> implements Monad<R>, Matchable<R, L>, Futurizable<L | R> {
  /**
   * Creates a `Right` instance.
   * @template T The type of the right value.
   * @param {T} value The right value.
   * @returns {Either<never, T>} A `Right` instance containing the value.
   * @example
   * const right = Either.right(5);
   * right.match(console.log, error => console.error(error.message)); // 5
   */
  static right<T>(value: T): Either<never, T> {
    return new Right(value);
  }

  /**
   * Creates a `Left` instance.
   * @template T The type of the left value.
   * @param {T} value The left value.
   * @returns {Either<T, never>} A `Left` instance containing the value.
   * @example
   * const left = Either.left('error');
   * left.match(console.log, error => console.error(error.message)); // 'error'
   */
  static left<T>(value: T): Either<T, never> {
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
    return matchable.match<Either<L, R>>(
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
   * @template T The type of the transformed value.
   * @param {(l: L) => T} transform The transformation function.
   * @returns {Either<T, R>} A new `Either` instance containing the transformed value.
   * @example
   * const result = Either.left('error').mapLeft(value => `Error: ${value}`);
   * result.match(console.log, console.error); // 'Error: error'
   */
  abstract mapLeft<T>(transform: (l: L) => T): Either<T, R>;

  /**
   * Transforms the right value contained in this `Either` instance into another `Either` instance.
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
   * @template T The type of the transformed value.
   * @param {(l: L) => Either<T, R>} transform The transformation function.
   * @returns {Either<T, R>} The result of the transformation function.
   * @example
   * const result = Either.left('error').flatMapLeft(value => Either.left(`Error: ${value}`));
   * result.match(console.log, console.error); // Error: error
   */
  abstract flatMapLeft<T>(transform: (l: L) => Either<T, R>): Either<T, R>;

  /**
   * Unwraps the value contained in this `Either` instance by applying the appropriate handler for both Left and Right cases.
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
   * @returns {Future<L | R>} A `Future` instance containing the value.
   * @example
   * const result = Either.right(5);
   * const asyncClosure: async (x: number) => x * 2
   * result.toFuture().map(asyncClosure).complete(
      async (value) => expect(await value).toEqual(expected), // 10
      async (error) => expect(error).toBeUndefined()
     );
   */
  abstract toFuture(): Future<L | R>;
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

  map(_: (r: never) => never): Either<L, never> {
    return new Left(this.value);
  }

  mapLeft<T>(transform: (l: L) => T): Either<T, never> {
    return new Left(transform(this.value));
  }

  flatMap(_: (r: never) => Either<L, never>): Either<L, never> {
    return new Left(this.value);
  }

  flatMapLeft<T>(transform: (l: L) => Either<T, never>): Either<T, never> {
    return transform(this.value);
  }

  match<T>(_: (_: never) => never, ifLeft: (l: L) => T): T {
    return ifLeft(this.value);
  }

  isLeft(): this is Left<L, never> {
    return true;
  }

  isRight(): this is Right<L, never> {
    return false;
  }

  toFuture(): Future<L> {
    return Future.of(() => Promise.resolve(this.value));
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

  mapLeft(_: (l: L) => never): Either<never, R> {
    return new Right(this.value);
  }

  flatMap<T>(transform: (r: R) => Either<never, T>): Either<never, T> {
    return transform(this.value);
  }

  flatMapLeft(_: (l: never) => Either<never, R>): Either<never, R> {
    return new Right(this.value);
  }

  match<T>(ifRight: (r: R) => T, _: (_: never) => never): T {
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
