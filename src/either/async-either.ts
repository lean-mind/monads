import { Either, FoldingEither } from './either';
import { Monad } from '../monad';

/**
 * Class representing an asynchronous computation that may result in one of two possible types.
 * AsyncEither wraps a Promise that resolves to an Either.
 * @template L The type of the left value (usually an error).
 * @template R The type of the right value (usually a success).
 */
export class AsyncEither<L, R> implements PromiseLike<Either<L, R>>, Monad<R> {
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
   * Unwraps the value contained in this AsyncEither instance by applying the appropriate handler for both Left and Right cases.
   * @template R The type of the right value.
   * @template L The type of the left value.
   * @template T The type of the result.
   * @param {FoldingEither<R, L, T>} folding The folding object containing the functions to call for each case.
   * @returns {Promise<T>} A Promise that resolves to the result of the folding function.
   * @example
   * const asyncEither = AsyncEither.fromSync(Either.right(5));
   * const result = await asyncEither.fold({
   *   ifRight: value => `Success: ${value}`,
   *   ifLeft: error => `Error: ${error}`
   * });
   * console.log(result); // 'Success: 5'
   */
  async fold<T>(folding: FoldingEither<R, L, T>): Promise<T> {
    const either = await this.promise;
    return either.fold(folding);
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
