import { Either } from './either';
import { Monad } from '../monad';
import { AsyncRailway, Folding } from '../railway';

/**
 * Class representing an asynchronous computation that may result in one of two possible types.
 * AsyncEither wraps a Promise that resolves to an Either.
 * @template L The type of the left value (usually an error).
 * @template R The type of the right value (usually a success).
 */
export class AsyncEither<L, R> implements PromiseLike<Either<L, R>>, Monad<R>, AsyncRailway<R, L> {
  private readonly promise: Promise<Either<L, R>>;

  private constructor(promise: Promise<Either<L, R>>) {
    this.promise = promise;
  }

  /**
   * Implements the PromiseLike interface to allow AsyncEither to work with Promise chains.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @template TResult1 The type of the result if the promise is fulfilled.
   * @template TResult2 The type of the result if the promise is rejected.
   * @param {((value: Either<L, R>) => TResult1 | PromiseLike<TResult1>) | null} onFulfilled The callback to execute when the Promise is resolved.
   * @param {((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null} onRejected The callback to execute when the Promise is rejected.
   * @returns {PromiseLike<TResult1 | TResult2>} A Promise for the completion of the callbacks.
   */
  then<TResult1 = Either<L, R>, TResult2 = never>(
    onFulfilled?: ((value: Either<L, R>) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.promise.then(onFulfilled, onRejected);
  }

  /**
   * Transforms the right value contained in this AsyncEither instance.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @template U The type of the transformed value.
   * @param {(value: R) => U | Promise<U>} f The transformation function.
   * @returns {AsyncEither<L, U>} A new AsyncEither instance containing the transformed value.
   * @example
   * const asyncEither = AsyncEither.fromSync(Either.right(5));
   * const result = await asyncEither.map(x => x * 2);
   * result.fold({ ifRight: console.log, ifLeft: console.error }); // 10
   */
  map<U>(f: (value: R) => U | Promise<U>): AsyncEither<L, U> {
    return new AsyncEither(
      this.promise.then(async (either) =>
        either.fold({
          ifLeft: async (value) => Either.left<L, U>(value),
          ifRight: async (value) => Either.right<L, U>(await f(value)),
        })
      )
    );
  }

  /**
   * Transforms the left value contained in this AsyncEither instance.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @template U The type of the transformed error value.
   * @param {(error: L) => U | Promise<U>} f The transformation function.
   * @returns {AsyncEither<U, R>} A new AsyncEither instance containing the transformed error.
   * @example
   * const asyncEither = AsyncEither.fromSync(Either.left('error'));
   * const result = await asyncEither.mapLeft(err => `${err}_transformed`);
   * result.fold({ ifRight: console.log, ifLeft: console.error }); // 'error_transformed'
   */
  mapLeft<U>(f: (error: L) => U | Promise<U>): AsyncEither<U, R> {
    return new AsyncEither(
      this.promise.then(async (either) =>
        either.fold({
          ifLeft: async (value) => Either.left<U, R>(await f(value)),
          ifRight: async (value) => Either.right<U, R>(value),
        })
      )
    );
  }

  /**
   * Transforms the right value contained in this AsyncEither instance into another AsyncEither or Either instance.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @template U The type of the new right value.
   * @param {(value: R) => AsyncEither<L, U> | Either<L, U>} f The transformation function.
   * @returns {AsyncEither<L, U>} A new AsyncEither instance containing the result of the transformation.
   * @example
   * const asyncEither = AsyncEither.fromSync(Either.right(5));
   * const result = await asyncEither.flatMap(x => AsyncEither.fromSync(Either.right(x * 2)));
   * result.fold({ ifRight: console.log, ifLeft: console.error }); // 10
   */
  flatMap<U>(f: (value: R) => AsyncEither<L, U> | Either<L, U>): AsyncEither<L, U> {
    return new AsyncEither(
      this.promise.then(async (either) => {
        return either.fold({
          ifLeft: async (value) => Either.left<L, U>(value),
          ifRight: async (value) => {
            const result = f(value);
            if (result instanceof AsyncEither) {
              return await result.promise;
            }
            return result;
          },
        });
      })
    );
  }

  /**
   * Transforms the left value contained in this AsyncEither instance into another AsyncEither or Either instance.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @template U The type of the new left value.
   * @param {(value: L) => AsyncEither<U, R> | Either<U, R>} f The transformation function.
   * @returns {AsyncEither<U, R>} A new AsyncEither instance containing the result of the transformation.
   * @example
   * const asyncEither = AsyncEither.fromSync(Either.left('error'));
   * const result = await asyncEither.flatMapLeft(err => AsyncEither.fromSync(Either.left(`${err}_handled`)));
   * result.fold({ ifRight: console.log, ifLeft: console.error }); // 'error_handled'
   */
  flatMapLeft<U>(f: (value: L) => AsyncEither<U, R> | Either<U, R>): AsyncEither<U, R> {
    return new AsyncEither(
      this.promise.then(async (either) =>
        either.fold({
          ifLeft: async (value) => {
            const result = f(value);
            if (result instanceof AsyncEither) {
              return await result.promise;
            }
            return result;
          },
          ifRight: async (value) => Either.right<U, R>(value),
        })
      )
    );
  }

  /**
   * Transforms the right value contained in this AsyncEither instance into another AsyncEither instance.
   * Implementation of the andThen method from the AsyncRailway interface.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @template U The type of the new right value.
   * @param {(value: R) => AsyncRailway<U, L> | Railway<U, L>} transform The transformation function.
   * @returns {AsyncEither<L, U>} A new AsyncEither instance containing the result of the transformation.
   */
  andThen<U>(transform: (value: R) => AsyncEither<L, U> | Either<L, U>): AsyncEither<L, U> {
    return this.flatMap(transform);
  }

  /**
   * Transforms the left value contained in this AsyncEither instance into another AsyncEither instance.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @template U The type of the new left value.
   * @param {(value: L) => AsyncRailway<R, U> | Railway<R, U>} transform The transformation function.
   * @returns {AsyncEither<U, R>} A new AsyncEither instance containing the result of the transformation.
   */
  orElse<U>(transform: (value: L) => AsyncEither<U, R> | Either<U, R>): AsyncEither<U, R> {
    return this.flatMapLeft(transform);
  }

  /**
   * Applies the appropriate function from the folding object based on whether the Either resolves to a Left or Right.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @template T The return type of the folding functions.
   * @param {Folding<'Either', R, L, T>} folding The folding object with functions for handling Left and Right cases.
   * @returns {Promise<T>} A promise that resolves to the result of the appropriate folding function.
   */
  async fold<T>(folding: Folding<'Either', R, L, T>): Promise<T> {
    const either = await this;
    return either.fold(folding);
  }

  /**
   * Adds a timeout to this AsyncEither.
   * @param {number} ms Timeout in milliseconds.
   * @param {() => L} onTimeout Function that returns the error value when timeout occurs.
   * @returns {AsyncEither<L, R>} A new AsyncEither with timeout configured.
   */
  withTimeout(ms: number, onTimeout: () => L): AsyncEither<L, R> {
    return new AsyncEither(
      Promise.race([
        this.promise,
        new Promise<Either<L, R>>((resolve) => setTimeout(() => resolve(Either.left<L, R>(onTimeout())), ms)),
      ])
    );
  }

  /**
   * Creates an AsyncEither from a Promise, handling any rejections with the provided function.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @param {Promise<R>} promise The promise to wrap.
   * @param {(error: unknown) => L} onReject The function to transform any rejection into a left value.
   * @returns {AsyncEither<L, R>} A new AsyncEither instance.
   * @example
   * const promise = Promise.resolve(5);
   * const asyncEither = AsyncEither.fromPromise(promise, err => `Error: ${err}`);
   * const result = await asyncEither;
   * result.fold({ ifRight: console.log, ifLeft: console.error }); // 5
   */
  static fromPromise<L, R>(promise: PromiseLike<R>, onReject: (error: unknown) => L): AsyncEither<L, R>;
  static fromPromise<L, R>(promise: Promise<R>, onReject: (error: unknown) => L): AsyncEither<L, R> {
    return new AsyncEither(
      promise.then((value) => Either.right<L, R>(value)).catch((error) => Either.left<L, R>(onReject(error)))
    );
  }

  /**
   * Creates an AsyncEither from a Promise that is guaranteed not to reject.
   * @template L The type of the left value (unused in this case).
   * @template R The type of the right value.
   * @param {Promise<R>} promise The promise to wrap.
   * @returns {AsyncEither<L, R>} A new AsyncEither instance.
   * @example
   * const promise = Promise.resolve(5);
   * const asyncEither = AsyncEither.fromSafePromise(promise);
   * const result = await asyncEither;
   * result.fold({ ifRight: console.log, ifLeft: console.error }); // 5
   */
  static fromSafePromise<L, R>(promise: PromiseLike<R>): AsyncEither<L, R>;
  static fromSafePromise<L, R>(promise: Promise<R>): AsyncEither<L, R> {
    return new AsyncEither(promise.then((value) => Either.right<L, R>(value)));
  }

  /**
   * Creates an AsyncEither from an Either, wrapping it in a resolved Promise.
   * @template L The type of the left value.
   * @template R The type of the right value.
   * @param {Either<L, R>} either The Either instance to wrap.
   * @returns {AsyncEither<L, R>} A new AsyncEither instance.
   * @example
   * const either = Either.right(5);
   * const asyncEither = AsyncEither.fromSync(either);
   * const result = await asyncEither;
   * result.fold({ ifRight: console.log, ifLeft: console.error }); // 5
   */
  static fromSync<L, R>(either: Either<L, R>): AsyncEither<L, R> {
    return new AsyncEither(Promise.resolve(either));
  }
}
