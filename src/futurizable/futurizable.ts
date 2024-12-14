import { Future } from '../future/future';

export interface Futurizable<T> {
  toFuture(): Future<T>;
}
