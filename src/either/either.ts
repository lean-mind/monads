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

  static complete<R>(completable: Completable<R>): AsyncEither<Error, R> {
    return completable.complete<Either<Error, R>>(
      (value: R) => Either.right(value),
      (error: Error) => Either.left(error)
    );
  }

  static catch<T>(execute: () => T): Either<Error, T> {
    try {
      return Either.right(execute());
    } catch (error) {
      return error instanceof Error ? Either.left(error) : Either.left(new Error('Unknown error'));
    }
  }

  abstract map<T>(transform: (r: R) => T): Either<L, T>;

  abstract mapLeft<T>(transform: (l: L) => T): Either<T, R>;

  abstract flatMap<T>(transform: (r: R) => Either<L, T>): Either<L, T>;

  abstract flatMapLeft<T>(transform: (l: L) => Either<T, R>): Either<T, R>;

  abstract match<T>(ifRight: (r: R) => T, ifLeft: (l: L) => T): T;

  abstract isLeft(): this is Left<L, R>;

  abstract isRight(): this is Right<L, R>;
}

class Left<L, R> extends Either<L, R> {
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
}

class Right<L, R> extends Either<L, R> {
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
}

export { Either, Right, Left, AsyncEither };
