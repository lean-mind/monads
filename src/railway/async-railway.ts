import { Folding, Kind, Railway } from './railway';

type AnyRailway<Acceptable, Unacceptable> = AsyncRailway<Acceptable, Unacceptable> | Railway<Acceptable, Unacceptable>;

export interface AsyncRailway<Acceptable, Unacceptable> {
  andThen<U>(transform: (value: Acceptable) => AnyRailway<U, Unacceptable>): AsyncRailway<U, Unacceptable>;
  orElse<U>(transform: (value: Unacceptable) => AnyRailway<Acceptable, U>): AsyncRailway<Acceptable, U>;
  fold<T>(folding: Folding<Kind, Acceptable, Unacceptable, T>): Promise<T>;
  withTimeout(ms: number, onTimeout: () => Unacceptable): AsyncRailway<Acceptable, Unacceptable>;
}
