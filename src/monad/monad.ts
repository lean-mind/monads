import { Functor } from './functor';

export interface Monad<T> extends Functor<T> {
  flatMap<U>(f: (value: T) => Monad<U>): Monad<U>;
}
