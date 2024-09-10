import { Monad } from '../monad';
import { Completable } from '../complete';

class Future<T> implements Monad<T>, Completable<T> {
  private constructor(private readonly action: () => Promise<T>) {}

  static of<T>(action: () => Promise<T>): Future<T> {
    return new Future(action);
  }

  map<U>(transform: (value: T) => U): Future<U> {
    return new Future<U>(() => this.action().then(transform));
  }

  flatMap<U>(transform: (value: T) => Future<U>): Future<U> {
    return new Future<U>(() => this.action().then((value) => transform(value).action()));
  }

  complete<S>(onSuccess: (value: T) => S, onFailure: (error: Error) => S): Promise<S> {
    return this.action().then(onSuccess).catch(onFailure);
  }
}

export { Future };
