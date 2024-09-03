export interface Functor<T> {
  map<U>(f: (value: T) => U): Functor<U>;
}
