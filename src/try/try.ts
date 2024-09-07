import { Monad } from '../monad';
import { Matchable } from '../match';
import { Fallible } from '../types';

abstract class Try<T> implements Monad<T>, Matchable<T, undefined> {
  static toExecute<T>(executable: Fallible<T>): Try<T> {
    try {
      return new Success(executable());
    } catch (error) {
      return new Failure(error);
    }
  }

  abstract map<U>(transform: (value: T) => U): Try<U>;

  abstract flatMap<U>(transform: (value: T) => Try<U>): Try<U>;

  abstract flatMapLeft<U>(transform: (value: T) => Try<U>): Try<U>;

  abstract match<U>(ifSuccess: (value: T) => U, ifFailure: (_: undefined) => U): U;

  abstract isSuccess(): this is Success<T>;

  abstract isFailure(): this is Failure<T>;
}

class Success<T> extends Try<T> {
  constructor(private value: T) {
    super();
  }

  flatMap<U>(transform: (value: T) => Try<U>): Try<U> {
    return transform(this.value);
  }

  isFailure(): this is Failure<T> {
    return false;
  }

  isSuccess(): this is Success<T> {
    return true;
  }

  map<U>(transform: (value: T) => U): Try<U> {
    return new Success(transform(this.value));
  }

  match<S>(ifSuccess: (value: T) => S, ifFailure: (other: undefined) => S): S {
    return ifFailure(this.value);
  }

  flatMapLeft<U>(transform: (value: T) => Try<U>): Try<U> {
    return new Success(this.value);
  }
}

class Failure<T> extends Try<T> {
  constructor(private error: Error) {
    super();
  }

  flatMap<U>(transform: (_: never) => Try<U>): Try<U> {
    return new Failure(this.error);
  }

  isFailure(): this is Failure<T> {
    return true;
  }

  isSuccess(): this is Success<T> {
    return false;
  }

  map<U>(transform: (value: T) => U): Try<U> {
    return new Failure(this.error);
  }

  match<U>(ifSuccess: (value: T) => U, ifFailure: (_: T) => U): U {
    return ifFailure(this.error);
  }

  flatMapLeft<U>(transform: (value: T) => Try<U>): Try<U> {
    return transform(this.error);
  }
}

export { Try, Success, Failure };
