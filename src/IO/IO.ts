import { Monad } from '../monad';

class IO<T> implements Monad<T> {
  private constructor(private description: () => T) {}

  static of<T>(sideEffect: () => T): IO<T> {
    return new IO(sideEffect);
  }

  flatMap<U>(transform: (value: T) => IO<U>): IO<U> {
    return new IO(() => transform(this.description()).run());
  }
  map<U>(transform: (value: T) => U): IO<U> {
    return new IO(() => transform(this.description()));
  }

  run(): T {
    return this.description();
  }
}

export { IO };
