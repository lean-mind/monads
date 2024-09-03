import { Monad } from '../monad';
import { Matchable } from '../match';

abstract class Either<L, R> implements Monad<R>, Matchable<R, L> {
  static right<T>(value: T): Either<never, T> {
    return new Right(value);
  }

  static left<T>(value: T): Either<T, never> {
    return new Left(value);
  }

  static from<L, R>(matchable: Matchable<R, L>): Either<L, R> {
    return matchable.match<Either<L, R>>(
      (value: R) => Either.right(value),
      (value: L) => Either.left(value)
    );
  }

  static catch<T>(execute: () => T): Either<Error, T> {
    try {
      return Either.right(execute());
    } catch (error) {
      return error instanceof Error ? Either.left(error) : Either.left(new Error('Unknown error'));
    }
  }

  abstract map<T>(f: (r: R) => T): Either<L, T>;

  abstract mapLeft<T>(f: (l: L) => T): Either<T, R>;

  abstract flatMap<T>(f: (r: R) => Either<L, T>): Either<L, T>;

  abstract flatMapLeft<T>(f: (l: L) => Either<T, R>): Either<T, R>;

  abstract match<T>(ifRight: (r: R) => T, ifLeft: (l: L) => T): T;

  abstract isLeft(): this is Left<L, R>;

  abstract isRight(): this is Right<L, R>;
}

class Left<L, R> extends Either<L, R> {
  constructor(private value: L) {
    super();
  }

  map<T>(_: (r: R) => T): Either<L, T> {
    return new Left(this.value);
  }

  mapLeft<T>(f: (l: L) => T): Either<T, R> {
    return new Left(f(this.value));
  }

  flatMap<T>(_: (r: never) => Either<L, T>): Either<L, T> {
    return new Left(this.value);
  }

  match<T>(_: (_: never) => never, ifLeft: (l: L) => T): T {
    return ifLeft(this.value);
  }

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }

  flatMapLeft<T>(f: (l: L) => Either<T, R>): Either<T, R> {
    return f(this.value);
  }
}

class Right<L, R> extends Either<L, R> {
  constructor(private value: R) {
    super();
  }

  map<T>(f: (r: R) => T): Either<L, T> {
    return new Right(f(this.value));
  }

  mapLeft<T>(_: (l: L) => T): Either<T, R> {
    return new Right(this.value);
  }

  flatMap<T>(f: (r: R) => Either<L, T>): Either<L, T> {
    return f(this.value);
  }

  match<T>(ifRight: (r: R) => T, _: (_: never) => never): T {
    return ifRight(this.value);
  }

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }

  flatMapLeft<T>(_: (l: never) => Either<T, R>): Either<T, R> {
    return new Right(this.value);
  }
}

export { Either, Right, Left };
