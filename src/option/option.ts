import { Nullable } from '../types';
import { Monad } from '../monad';
import { Matchable } from '../match';

abstract class Option<T> implements Monad<T>, Matchable<T, undefined> {
  static of<T>(value: Nullable<T>): Option<T> {
    if (value == null) {
      return new None();
    }
    return new Some(value);
  }

  static from<T>(matchable: Matchable<T, unknown>) {
    return matchable.match<Option<T>>(
      (value: T) => Option.of(value),
      () => Option.of<T>(undefined)
    );
  }

  abstract getOrElse(otherValue: T): T;

  abstract filter(predicate: (value: T) => boolean): Option<T>;

  abstract map<U>(transform: (value: T) => U): Option<U>;

  abstract flatMap<U>(transform: (value: T) => Option<U>): Option<U>;

  abstract match<U>(ifSome: (value: T) => U, ifNone: (_: undefined) => U): U;

  abstract isSome(): this is Some<T>;

  abstract isNone(): this is None<T>;
}

class Some<T> extends Option<T> {
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
