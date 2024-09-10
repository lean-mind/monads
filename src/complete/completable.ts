export interface Completable<T> {
  complete<S>(onSuccess: (value: T) => S, onFailure: (error: Error) => S): Promise<S>;
}
