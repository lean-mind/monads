export interface Matchable<T, U> {
  match<S>(f: (value: T) => S, g: (other: U) => S): S;
}
