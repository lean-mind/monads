import { Monad } from '../monad';
import { Matchable } from '../match';

abstract class Try<T> implements Monad<T>, Matchable<T, Error> {
  static execute<T>(executable: () => T): Try<T> {
    try {
      return new Success(executable());
    } catch (error) {
      return new Failure(error as Error);
    }
  }

  abstract map<U>(transform: (value: T) => U): Try<U>;

  abstract flatMap<U>(transform: (value: T) => Try<U>): Try<U>;

  abstract match<U>(ifSuccess: (value: T) => U, ifFailure: (error: Error) => U): U;

  abstract isSuccess(): this is Success<T>;

  abstract isFailure(): this is Failure<T>;
}

class Success<T> extends Try<T> {
  constructor(private value: T) {
    super();
  }

  map<U>(transform: (value: T) => U): Try<U> {
    return new Success(transform(this.value));
  }
  flatMap<U>(transform: (value: T) => Try<U>): Try<U> {
    return transform(this.value);
  }
  match<U>(ifSuccess: (value: T) => U, ifFailure: (_: never) => U): U {
    return ifSuccess(this.value);
  }
  isSuccess(): this is Success<T> {
    return true;
  }
  isFailure(): this is Failure<T> {
    return false;
  }
}

class Failure<T> extends Try<T> {
  constructor(private error: Error) {
    super();
  }

  map<U>(transform: (_: never) => never): Try<never> {
    return new Failure(this.error);
  }
  flatMap<U>(transform: (_: never) => Try<never>): Try<never> {
    return new Failure(this.error);
  }
  match<U>(ifSuccess: (_: never) => never, ifFailure: (error: Error) => U): U {
    return ifFailure(this.error);
  }
  isSuccess(): this is Success<T> {
    return false;
  }
  isFailure(): this is Failure<T> {
    return true;
  }
}

export { Try, Success, Failure };
