import { Nullable } from '../types';
import { Monad } from '../monad';
import { Matchable } from '../match';

/**
 * Description placeholder
 *
 * @abstract
 * @class Option
 * @typedef {Option}
 * @template T
 * @implements {Monad<T>}
 * @implements {Matchable<T, undefined>}
 */
abstract class Option<T> implements Monad<T>, Matchable<T, undefined> {
  
  /**
   * Description placeholder
   *
   * @static
   * @template T
   * @param {Nullable<T>} value
   * @returns {Option<T>}
   */
  static of<T>(value: Nullable<T>): Option<T> {
    if (value == null) {
      return new None();
    }
    return new Some(value);
  }
  
  /**
   * Description placeholder
   *
   * @static
   * @template T
   * @param {Matchable<T, unknown>} matchable
   * @returns {*}
   */
  static from<T>(matchable: Matchable<T, unknown>) {
    return matchable.match<Option<T>>(
      (value: T) => Option.of(value),
      () => Option.of<T>(undefined)
    );
  }
  
  /**
   * Description placeholder
   *
   * @abstract
   * @param {T} otherValue
   * @returns {T}
   */
  abstract getOrElse(otherValue: T): T;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @param {(value: T) => boolean} predicate
   * @returns {Option<T>}
   */
  abstract filter(predicate: (value: T) => boolean): Option<T>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @template U
   * @param {(value: T) => U} transform
   * @returns {Option<U>}
   */
  abstract map<U>(transform: (value: T) => U): Option<U>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @template U
   * @param {(value: T) => Option<U>} transform
   * @returns {Option<U>}
   */
  abstract flatMap<U>(transform: (value: T) => Option<U>): Option<U>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @template U
   * @param {(value: T) => U} ifSome
   * @param {(_: undefined) => U} ifNone
   * @returns {U}
   */
  abstract match<U>(ifSome: (value: T) => U, ifNone: (_: undefined) => U): U;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @returns {this is Some<T>}
   */
  abstract isSome(): this is Some<T>;
  
  /**
   * Description placeholder
   *
   * @abstract
   * @returns {this is None<T>}
   */
  abstract isNone(): this is None<T>;
  
}

/**
 * Description placeholder
 *
 * @class Some
 * @typedef {Some}
 * @template T
 * @extends {Option<T>}
 */
class Some<T> extends Option<T> {
  
  /**
   * Creates an instance of Some.
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
   * @param {T} _
   * @returns {T}
   */
  getOrElse(_: T): T {
    return this.value;
  }
  
  /**
   * Description placeholder
   *
   * @param {(value: T) => boolean} predicate
   * @returns {Option<T>}
   */
  filter(predicate: (value: T) => boolean): Option<T> {
    return predicate(this.value) ? new Some(this.value) : new None();
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => U} transform
   * @returns {Option<U>}
   */
  map<U>(transform: (value: T) => U): Option<U> {
    return new Some(transform(this.value));
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => Option<U>} transform
   * @returns {Option<U>}
   */
  flatMap<U>(transform: (value: T) => Option<U>): Option<U> {
    return transform(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => U} some
   * @param {(_: never) => never} _
   * @returns {U}
   */
  match<U>(some: (value: T) => U, _: (_: never) => never): U {
    return some(this.value);
  }
  
  /**
   * Description placeholder
   *
   * @returns {this is None<T>}
   */
  isNone(): this is None<T> {
    return false;
  }
  
  /**
   * Description placeholder
   *
   * @returns {this is Some<T>}
   */
  isSome(): this is Some<T> {
    return true;
  }
}

/**
 * Description placeholder
 *
 * @class None
 * @typedef {None}
 * @template T
 * @extends {Option<T>}
 */
class None<T> extends Option<T> {
  
  /**
   * Description placeholder
   *
   * @param {T} value
   * @returns {T}
   */
  getOrElse(value: T): T {
    return value;
  }
  
  /**
   * Description placeholder
   *
   * @param {(value: T) => boolean} _
   * @returns {Option<T>}
   */
  filter(_: (value: T) => boolean): Option<T> {
    return new None();
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => U} _
   * @returns {Option<U>}
   */
  map<U>(_: (value: T) => U): Option<U> {
    return new None();
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(value: T) => Option<U>} _
   * @returns {Option<U>}
   */
  flatMap<U>(_: (value: T) => Option<U>): Option<U> {
    return new None();
  }
  
  /**
   * Description placeholder
   *
   * @template U
   * @param {(_: never) => never} _
   * @param {(noneValue: undefined) => U} none
   * @returns {U}
   */
  match<U>(_: (_: never) => never, none: (noneValue: undefined) => U): U {
    return none(undefined);
  }
  
  /**
   * Description placeholder
   *
   * @returns {this is None<T>}
   */
  isNone(): this is None<T> {
    return true;
  }
  
  /**
   * Description placeholder
   *
   * @returns {this is Some<T>}
   */
  isSome(): this is Some<T> {
    return false;
  }
}

export { Option, Some, None };
