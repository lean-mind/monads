import { Future } from '../future';

export interface Futurizable<T> {
  toFuture(): Future<T>;
}
