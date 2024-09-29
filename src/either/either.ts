import { Monad } from '../monad';
import { Matchable } from '../match';

/**
 * Description placeholder
 *
 * @abstract
 * @class Either
 * @typedef {Either}
 * @template L
 * @template R
 * @implements {Monad<R>}
 * @implements {Matchable<R, L>}
 */
abstract class Either<L, R> implements Monad<R>, Matchable<R, L> {
  
  /**
   * Description placeholder
   *
   * @static
   * @template T
   * @param {T} value
   * @returns {Either<never, T>}
   */
  static right<T>(value: T): Either<never, T> {
    return new Right(value);
  }
  
  /**
   * Description placeholder
   *
   * @static
   * @template T
   * @param {T} value
   * @returns {Either<T, never>}
   */
  static left<T>(value: T): Either<T, never> {
    return new Left(value);
  }
  
  /**
   * Description placeholder
   *
   * @static
   * @template L
   * @template R
   * @param {Matchable<R, L>} matchable
   * @returns {Either<L, R>}
   */
  static from<L, R>(matchable: Matchable<R, L>): Either<L, R> {
    return matchable.match<Either<L, R>>(
      (value: R) => Either.right(value),
      (value: L) => Either.left(value)
    );
  }
  
  /**
   * Description placeholder
   *
   * @static
   * @template T
   * @param {() => T} execute
   * @returns {Either<Error, T>}
   */
  static catch<T>(execute: () => T): Either<Error, T> {
    try {
      return Either.right(execute());
    } catch (error) {
      return error instanceof Error ? Either.left(error) : Either.left(new Error('Unknown error'));
    }
  }

  /**
   * Description placeholder
   *
   * @abstract
   * @template T
   * @param {(r: R) => T} transform
   * @returns {Either<L, T>}
   */
  abstract map<T>(transform: (r: R) => T): Either<L, T>;

  /**
   * Description placeholder
   *
   * @abstract
   * @template T
   * @param {(l: L) => T} transform
   * @returns {Either<T, R>}
   */
  abstract mapLeft<T>(transform: (l: L) => T): Either<T, R>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @template T
   * @param {(r: R) => Either<L, T>} transform
   * @returns {Either<L, T>}
   */
  abstract flatMap<T>(transform: (r: R) => Either<L, T>): Either<L, T>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @template T
   * @param {(l: L) => Either<T, R>} transform
   * @returns {Either<T, R>}
   */
  abstract flatMapLeft<T>(transform: (l: L) => Either<T, R>): Either<T, R>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @template T
   * @param {(r: R) => T} ifRight
   * @param {(l: L) => T} ifLeft
   * @returns {T}
   */
  abstract match<T>(ifRight: (r: R) => T, ifLeft: (l: L) => T): T;

  
  /**
   * Description placeholder
   *
   * @abstract
   * @returns {this is Left<L, R>}
   */
  abstract isLeft(): this is Left<L, R>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @returns {this is Right<L, R>}
   */
  abstract isRight(): this is Right<L, R>;
}

/**
 * Description placeholder
 *
 * @class Left
 * @typedef {Left}
 * @template L
 * @template R
 * @extends {Either<L, R>}
 */
class Left<L, R> extends Either<L, R> {
  
  /**
   * Creates an instance of Left.
   *
   * @constructor
   * @param {L} value
   */
  constructor(private value: L) {
    super();
  }
  
  /**
   * Description placeholder
   *
   * @param {(r: never) => never} _
   * @returns {Either<L, never>}
   */
  map(_: (r: never) => never): Either<L, never> {
    return new Left(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @template T
   * @param {(l: L) => T} transform
   * @returns {Either<T, never>}
   */
  mapLeft<T>(transform: (l: L) => T): Either<T, never> {
    return new Left(transform(this.value));
  }
  
  /**
   * Description placeholder
   *
   * @param {(r: never) => Either<L, never>} _
   * @returns {Either<L, never>}
   */
  flatMap(_: (r: never) => Either<L, never>): Either<L, never> {
    return new Left(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @template T
   * @param {(l: L) => Either<T, never>} transform
   * @returns {Either<T, never>}
   */
  flatMapLeft<T>(transform: (l: L) => Either<T, never>): Either<T, never> {
    return transform(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @template T
   * @param {(_: never) => never} _
   * @param {(l: L) => T} ifLeft
   * @returns {T}
   */
  match<T>(_: (_: never) => never, ifLeft: (l: L) => T): T {
    return ifLeft(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @returns {this is Left<L, never>}
   */
  isLeft(): this is Left<L, never> {
    return true;
  }
  
  /**
   * Description placeholder
   *
   * @returns {this is Right<L, never>}
   */
  isRight(): this is Right<L, never> {
    return false;
  }
}

/**
 * Description placeholder
 *
 * @class Right
 * @typedef {Right}
 * @template L
 * @template R
 * @extends {Either<L, R>}
 */
class Right<L, R> extends Either<L, R> {
  
  /**
   * Creates an instance of Right.
   *
   * @constructor
   * @param {R} value
   */
  constructor(private value: R) {
    super();
  }
  
  /**
   * Description placeholder
   *
   * @template T
   * @param {(r: R) => T} transform
   * @returns {Either<never, T>}
   */
  map<T>(transform: (r: R) => T): Either<never, T> {
    return new Right(transform(this.value));
  }
  
  /**
   * Description placeholder
   *
   * @param {(l: L) => never} _
   * @returns {Either<never, R>}
   */
  mapLeft(_: (l: L) => never): Either<never, R> {
    return new Right(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @template T
   * @param {(r: R) => Either<never, T>} transform
   * @returns {Either<never, T>}
   */
  flatMap<T>(transform: (r: R) => Either<never, T>): Either<never, T> {
    return transform(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @param {(l: never) => Either<never, R>} _
   * @returns {Either<never, R>}
   */
  flatMapLeft(_: (l: never) => Either<never, R>): Either<never, R> {
    return new Right(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @template T
   * @param {(r: R) => T} ifRight
   * @param {(_: never) => never} _
   * @returns {T}
   */
  match<T>(ifRight: (r: R) => T, _: (_: never) => never): T {
    return ifRight(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @returns {this is Left<never, R>}
   */
  isLeft(): this is Left<never, R> {
    return false;
  }
  
  /**
   * Description placeholder
   *
   * @returns {this is Right<never, R>}
   */
  isRight(): this is Right<never, R> {
    return true;
  }
}

export { Either, Right, Left };
