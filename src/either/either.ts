abstract class Either<L, R> {
  static right<T>(value: T): Either<never, T> {
    return new Right(value);
  }
  static left<T>(value: T): Either<T, never> {
    return new Left(value);
  }

  abstract map<T>(f: (r: R) => T): Either<L, T>;
  abstract mapLeft<T>(f: (l: L) => T): Either<T, R>;
  abstract flatMap<T>(f: (r: R) => Either<L, T>): Either<L, T>;
  abstract flatMapLeft<T>(f: (l: L) => Either<T, R>): Either<T, R>;
  abstract match<T>(fl: (l: L) => T, fr: (r: R) => T): T;
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

  flatMap<T>(_: (r: R) => Either<L, T>): Either<L, T> {
    return new Left(this.value);
  }

  match<T>(fl: (error: L) => T, _: (r: R) => T): T {
    return fl(this.value);
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

  match<T>(_: (l: L) => T, fr: (r: R) => T): T {
    return fr(this.value);
  }

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }

  flatMapLeft<T>(f: (l: L) => Either<T, R>): Either<T, R> {
    return new Right(this.value);
  }
}

export { Either, Right, Left };
