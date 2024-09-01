import { Nullable } from '../types';

abstract class Option<T> {
  static of<T>(value: Nullable<T>): Option<T> {
    if (value == null) {
      return new None();
    }
    return new Some(value);
  }

  abstract getOrElse(otherValue: T): T;

  abstract filter(predicate: (value: T) => boolean): Option<T>;

  abstract map<U>(transform: (value: T) => U): Option<U>;

  abstract flatMap<U>(transform: (value: T) => Option<U>): Option<U>;

  abstract match<U>(ifSome: (value: T) => U, ifNone: () => U): U;

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

  match<U>(some: (value: T) => U, _: () => never): U {
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

  match<U>(_: (value: T) => never, none: () => U): U {
    return none();
  }

  isNone(): this is None<T> {
    return true;
  }

  isSome(): this is Some<T> {
    return false;
  }
}

export { Option, Some, None };
