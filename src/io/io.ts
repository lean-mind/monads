import { Monad } from '../monad';
import { Futurizable } from '../futurizable';
import { Future } from '../future';

/**
 * Class representing an IO monad, which encapsulates a computation description that may produce a side effect.
 * @template T The type of the value produced by the IO computation.
 */
class IO<T> implements Monad<T>, Futurizable<T> {
  /**
   * Creates a new `IO` instance.
   * @param {() => T} description The computation.
   * @private
   */
  private constructor(private description: () => T) {}

  /**
   * Creates an `IO` instance from a computation that may produce a side effect.
   * @template T The type of the value produced by the IO computation.
   * @param {() => T} sideEffect The computation.
   * @returns {IO<T>} A new `IO` instance.
   * @example
   * const io = IO.of(() => console.log('Hello, World!'));
   * io.runUnsafe(); // Hello, World!
   */
  static of<T>(sideEffect: () => T): IO<T> {
    return new IO(sideEffect);
  }

  /**
   * Transforms the value produced by this `IO` instance into another `IO` instance.
   * @template U The type of the transformed value.
   * @param {(value: T) => IO<U>} transform The transformation function.
   * @returns {IO<U>} A new `IO` instance containing the transformed value.
   * @example
   * const io = IO.of(() => 5).flatMap(value => IO.of(() => value * 2));
   * console.log(io.runUnsafe()); // 10
   */
  flatMap<U>(transform: (value: T) => IO<U>): IO<U> {
    return new IO(() => transform(this.description()).runUnsafe());
  }

  /**
   * Transforms the value produced by this `IO` instance.
   * @template U The type of the transformed value.
   * @param {(value: T) => U} transform The transformation function.
   * @returns {IO<U>} A new `IO` instance containing the transformed value.
   * @example
   * const io = IO.of(() => 5).map(value => value * 2);
   * console.log(io.runUnsafe()); // 10
   */
  map<U>(transform: (value: T) => U): IO<U> {
    return new IO(() => transform(this.description()));
  }

  /**
   * Executes the computation and returns the result.
   * @returns {T} The result of the computation.
   * @example
   * const io = IO.of(() => 5);
   * console.log(io.runUnsafe()); // 5
   */
  runUnsafe(): T {
    return this.description();
  }

  toFuture(): Future<T> {
    return Future.of(
      () =>
        new Promise<T>((resolve, reject) => {
          try {
            resolve(this.runUnsafe());
          } catch (error) {
            reject(error);
          }
        })
    );
  }
}

export { IO };
