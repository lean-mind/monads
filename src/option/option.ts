import { NotNullable, Nullable } from '../types';
import { Monad } from '../monad';
import { Matchable } from '../match';

/**
 * Abstract class representing an optional value.
 * @template T The type of the value.
 */
abstract class Option<T> implements Monad<T>, Matchable<T, undefined> {
  /**
   * Creates an `Option` instance from a nullable value.
   * @template T The type of the value.
   * @param {Nullable<T>} value The nullable value.
   * @returns {Option<T>} A `Some` instance if the value is not null or undefined, otherwise a `None` instance.
   * @example
   * const some = Option.of(5);
   * some.match(console.log, () => console.log('none')); // 5
   *
   * const none = Option.of(null);
   * none.match(console.log, () => console.log('none')); // none
   */
  static of<T>(value: Nullable<T>): Option<T> {
    if (value == null) {
      return new None();
    }
    return new Some(value);
  }

  /**
   * Creates an `Option` instance from a value.
   * @template T The type of the value.
   * @param {NotNullable<T>} value The nullable value.
   * @returns {Some<T>} A `Some` instance of the value
   * @example
   * const some = Option.ofSome(5);
   * some.match(console.log, () => console.log('none')); // 5
   */
  static ofSome<T>(value: NotNullable<T>): Option<T> {
    return new Some(value);
  }

  /**
   * Creates a `None` instance.
   * @returns {None} A `None` instance.
   * @example
   * const none = Option.ofNone();
   * none.match(console.log, () => console.log('none')); // none
   */
  static ofNone<T>(): Option<T> {
    return new None();
  }

  /**
   * Creates an `Option` instance from a `Matchable` instance.
   * @template T The type of the value.
   * @param {Matchable<T, unknown>} matchable The matchable instance.
   * @returns {Option<T>} A `Some` instance if the matchable contains a value, otherwise a `None` instance.
   * @example
   * const either = Either.right(5);
   * const option = Option.from(either);
   * option.match(console.log, () => console.log('none')); // 5
   */
  static from<T>(matchable: Matchable<T, unknown>): Option<T> {
    return matchable.match<Option<T>>(
      (value: T) => Option.of(value),
      () => Option.of<T>(undefined)
    );
  }

  /**
   * Returns the value if present, otherwise returns the provided default value.
   * @param {T} otherValue The default value.
   * @returns {T} The value if present, otherwise the default value.
   * @example
   * const some = Option.of(5);
   * console.log(some.getOrElse(0)); // 5
   *
   * const none = Option.of(null);
   * console.log(none.getOrElse(0)); // 0
   */
  abstract getOrElse(otherValue: T): T;

  /**
   * Filters the value using a predicate function.
   * @param {(value: T) => boolean} predicate The predicate function.
   * @returns {Option<T>} A `Some` instance if the value matches the predicate, otherwise a `None` instance.
   * @example
   * const some = Option.of(5).filter(value => value > 3);
   * some.match(console.log, () => console.log('none')); // 5
   *
   * const none = Option.of(2).filter(value => value > 3);
   * none.match(console.log, () => console.log('none')); // none
   */
  abstract filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * Transforms the value contained in this `Option` instance.
   * @template U The type of the transformed value.
   * @param {(value: T) => U} transform The transformation function.
   * @returns {Option<U>} A new `Option` instance containing the transformed value.
   * @example
   * const some = Option.of(5).map(value => value * 2);
   * some.match(console.log, () => console.log('none')); // 10
   */
  abstract map<U>(transform: (value: T) => U): Option<U>;

  /**
   * Transforms the value contained in this `Option` instance into another `Option` instance.
   * @template U The type of the transformed value.
   * @param {(value: T) => Option<U>} transform The transformation function.
   * @returns {Option<U>} The result of the transformation function.
   * @example
   * const some = Option.of(5).flatMap(value => Option.of(value * 2));
   * some.match(console.log, () => console.log('none')); // 10
   */
  abstract flatMap<U>(transform: (value: T) => Option<U>): Option<U>;

  /**
   * Unwraps the value contained in this `Option` instance by applying the appropriate handler for both Some and None cases.
   * @template U The type of the result.
   * @param {(value: T) => U} ifSome The function to call if this is a `Some` instance.
   * @param {(_: undefined) => U} ifNone The function to call if this is a `None` instance.
   * @returns {U} The result of the matching function.
   * @example
   * const some = Option.of(5);
   * some.match(console.log, () => console.log('none')); // 5
   *
   * const none = Option.of(null);
   * none.match(console.log, () => console.log('none')); // none
   */
  abstract match<U>(ifSome: (value: T) => U, ifNone: (_: undefined) => U): U;

  /**
   * Checks if this is a `Some` instance.
   * @returns {boolean} `true` if this is a `Some` instance, otherwise `false`.
   * @example
   * const some = Option.of(5);
   * some.match(value => console.log(value.isSome()), () => console.log('none')); // true
   */
  abstract isSome(): this is Some<T>;

  /**
   * Checks if this is a `None` instance.
   * @returns {boolean} `true` if this is a `None` instance, otherwise `false`.
   * @example
   * const none = Option.of(null);
   * none.match(console.log, none => console.log(none.isNone())); // true
   */
  abstract isNone(): this is None<T>;
}

/**
 * Class representing an optional value that is present.
 * @template T The type of the value.
 */
class Some<T> extends Option<T> {
  /**
   * Creates a new `Some` instance.
   * @param {T} value The value of the optional.
   */
  constructor(private value: T) {
    super();
  }

  getOrElse(_: T): T {
    return this.value;
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    return predicate(this.value) ? new Some(this.value) : new None();
  }

  map<U>(transform: (value: T) => U): Option<U> {
    return new Some(transform(this.value));
  }

  flatMap<U>(transform: (value: T) => Option<U>): Option<U> {
    return transform(this.value);
  }

  match<U>(some: (value: T) => U, _: (_: never) => never): U {
    return some(this.value);
  }

  isNone(): this is None<T> {
    return false;
  }

  isSome(): this is Some<T> {
    return true;
  }
}

/**
 * Class representing an optional value that is absent.
 * @template T The type of the value.
 */
class None<T> extends Option<T> {
  getOrElse(value: T): T {
    return value;
  }

  filter(_: (value: T) => boolean): Option<T> {
    return new None();
  }

  map<U>(_: (value: T) => U): Option<U> {
    return new None();
  }

  flatMap<U>(_: (value: T) => Option<U>): Option<U> {
    return new None();
  }

  match<U>(_: (_: never) => never, none: (noneValue: undefined) => U): U {
    return none(undefined);
  }

  isNone(): this is None<T> {
    return true;
  }

  isSome(): this is Some<T> {
    return false;
  }
}

export { Option, Some, None };
