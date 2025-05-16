import { Folding, Kind } from './foldable';

interface AsyncFoldable<Acceptable, Unacceptable> {
  fold<T>(folding: Folding<Kind, Acceptable, Unacceptable, T>): Promise<T>;
}

export { AsyncFoldable };
