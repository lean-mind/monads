import { Nullable, Present } from '../types';
import { Monad } from '../monad';
import { Futurizable } from '../futurizable';
import { Future } from '../future';
import { Folding, Railway } from '../railway';

type FoldingOption<T, U> = Folding<'Option', T, undefined, U>;

/**
 * Abstract class representing an optional value.
 * @template T The type of the value.
 */
abstract class Option<T> implements Monad<T>, Futurizable<T>, Railway<T, undefined> {
  /**
   * Creates an `Option` instance from a nullable value.
   * @template T The type of the value.
   * @param {Nullable<T>} value The nullable value.
   * @returns {Option<T>} A `Some` instance if the value is not null or undefined, otherwise a `None` instance.
   * @example
   * const some = Option.of(5);
   * some.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // 5
   *
   * const none = Option.of(null);
   * none.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // none
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
   * @param {Present<T>} value The nullable value.
   * @returns {Some<T>} A `Some` instance of the value
   * @example
   * const some = Option.some(5);
   * some.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // 5
   */
  static some<T>(value: Present<T>): Option<T> {
    return new Some(value);
  }

  /**
   * Creates a `None` instance.
   * @returns {None} A `None` instance.
   * @example
   * const none = Option.none();
   * none.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // none
   */
  static none<T>(): Option<T> {
    return new None();
  }

  /**
   * Creates an `Option` instance from a `Foldable` instance.
   * @template T The type of the value.
   * @param {Railway<T, unknown>} foldable The foldable instance.
   * @returns {Option<T>} A `Some` instance if the foldable contains a value, otherwise a `None` instance.
   * @example
   * const either = Either.right(5);
   * const option = Option.from(either);
   * option.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // 5
   */
  static from<T>(foldable: Railway<T, unknown>): Option<T> {
    return foldable.fold<Option<T>>({
      ifSome: (value: T) => Option.of(value),
      ifNone: () => Option.none(),
      ifSuccess: (value: T) => Option.of(value),
      ifFailure: () => Option.none(),
      ifRight: (value: T) => Option.of(value),
      ifLeft: () => Option.none(),
    });
  }

  /**
   * Returns the value if present, otherwise returns the provided default value.
   * @param {T} otherValue The default value.
   * @returns {T} The value if present, otherwise the default value.
   * @example
   * const some = Option.of(5);
   * some.getOrElse(0); // 5
   *
   * const none = Option.of(null);
   * none.getOrElse(0); // 0
   */
  abstract getOrElse(otherValue: T): T;

  /**
   * Filters the value using a predicate function.
   * @param {(value: T) => boolean} predicate The predicate function.
   * @returns {Option<T>} A `Some` instance if the value matches the predicate, otherwise a `None` instance.
   * @example
   * const some = Option.of(5).filter(value => value > 3);
   * some.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // 5
   *
   * const none = Option.of(2).filter(value => value > 3);
   * none.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // none
   */
  abstract filter(predicate: (value: T) => boolean): Option<T>;

  /**
   * Transforms the value contained in this `Option` instance.
   * @template T The type of the value.
   * @template U The type of the transformed value.
   * @param {(value: T) => U} transform The transformation function.
   * @returns {Option<U>} A new `Option` instance containing the transformed value.
   * @example
   * const some = Option.of(5).map(value => value * 2);
   * some.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // 10
   */
  abstract map<U>(transform: (value: T) => U): Option<U>;

  /**
   * Transforms the value contained in this `Option` instance into another `Option` instance.
   * @template T The type of the value.
   * @template U The type of the transformed value.
   * @param {(value: T) => Option<U>} transform The transformation function.
   * @returns {Option<U>} The result of the transformation function.
   * @example
   * const some = Option.of(5).flatMap(value => Option.of(value * 2));
   * some.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // 10
   */
  abstract flatMap<U>(transform: (value: T) => Option<U>): Option<U>;

  /**
   * Executes an action if this is a `Some` instance.
   * @template T The type of the value.
   * @param {(value: T) => void} action The action to execute if this is a `Some` instance.
   * @returns {Option<T>} The current `Option` instance.
   * @example
   * const result = Option.some(5).onSome(value => console.log(value)); // 5
   */
  abstract onSome(action: (value: T) => void): Option<T>;

  /**
   * Executes an action if this is a `None` instance.
   * @param {() => void} action The action to execute if this is a `None` instance.
   * @returns {Option<T>} The current `Option` instance.
   * @example
   * const result = Option.none().onNone(() => console.log('none')); // none
   */
  abstract onNone(action: () => void): Option<T>;

  /**
   * Transforms a `Some` into another `Option` instance.
   * @template T The type of the value.
   * @template U The type of the transformed value.
   * @param {(value: T) => Option<U>} transform The transformation function.
   * @returns {Option<U>} The result of the transformation function.
   * @example
   * const some = Option.of(5).andThen(value => Option.of(value * 2));
   * some.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // 10
   */
  abstract andThen<U>(transform: (value: T) => Option<U>): Option<U>;

  /**
   * Transforms a `None` into another `Option` instance.
   * @template T The type of the value.
   * @param {(value: undefined) => Option<T>} transform The transformation function.
   * @returns {Option<T>} The result of the transformation function.
   * @example
   * const none = Option.of<number>(undefined).orElse(value => Option.of(5));
   * none.fold({ ifSome: console.log, ifNone: () => console.log('none') }); // 5
   */
  abstract orElse(transform: (value: undefined) => Option<T>): Option<T>;

  /**
   * Unwraps the value contained in this `Option` instance by applying the appropriate handler for both Some and None cases.
   * @template T The type of the value.
   * @template U The type of the result.
   * @param {FoldingOption<T, U>} folding The folding object containing the functions to call for each case.
   * @returns {U} The result of the folding function.
   * @example
   * const result = Option.some(5);
   * result.fold({ ifSome: console.log, ifNone: () => console.error('Value is empty') }); // 5
   */
  abstract fold<U>(folding: FoldingOption<T, U>): U;

  /**
   * Checks if this is a `Some` instance.
   * @returns {boolean} `true` if this is a `Some` instance, otherwise `false`.
   * @example
   * const some = Option.of(5);
   * some.isSome(); // true
   */
  abstract isSome(): this is Some<T>;

  /**
   * Checks if this is a `None` instance.
   * @returns {boolean} `true` if this is a `None` instance, otherwise `false`.
   * @example
   * const none = Option.of(null);
   * none.isNone(); // true
   */
  abstract isNone(): this is None<T>;

  /**
   * Converts this `Option` instance into a `Future` instance.
   * @returns {Future<T>} A new `Future` instance.
   * @example
   * const some = Option.of(5);
   * const future = some.toFuture();
   * future.complete(console.log, console.error); // 5
   *
   * @example
   * const none = Option.of(null);
   * const future = none.toFuture();
   * future.complete(console.log, console.error); // Error: No value provided
   */
  abstract toFuture(): Future<T>;
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

  onSome(action: (value: T) => void): Option<T> {
    action(this.value);
    return this;
  }

  onNone(_: () => void): Option<T> {
    return this;
  }

  andThen<U>(transform: (value: T) => Option<U>): Option<U> {
    return transform(this.value);
  }

  orElse(_: (value: undefined) => Option<T>): Option<T> {
    return new Some(this.value);
  }

  fold<U>(folding: FoldingOption<T, U>): U {
    return folding.ifSome(this.value);
  }

  isNone(): this is None<T> {
    return false;
  }

  isSome(): this is Some<T> {
    return true;
  }

  toFuture(): Future<T> {
    return Future.of(() => Promise.resolve(this.value));
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

  onSome(_: (value: T) => void): Option<T> {
    return this;
  }

  onNone(action: () => void): Option<T> {
    action();
    return this;
  }

  andThen<U>(_: (value: T) => Option<U>): Option<U> {
    return new None();
  }
  orElse<T>(transform: (value: undefined) => Option<T>): Option<T> {
    return transform(undefined);
  }

  fold<U>(folding: FoldingOption<T, U>): U {
    return folding.ifNone(undefined);
  }

  isNone(): this is None<T> {
    return true;
  }

  isSome(): this is Some<T> {
    return false;
  }

  toFuture(): Future<T> {
    return Future.of(() => Promise.reject(new Error('No value provided')));
  }
}

export { Option, Some, None };
