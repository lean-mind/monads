export type Kind = 'Option' | 'Either' | 'Try';

type OptionFoldingKeys = ['ifSome', 'ifNone'];
type EitherFoldingKeys = ['ifRight', 'ifLeft'];
type TryFoldingKeys = ['ifSuccess', 'ifFailure'];

export type Pair<K extends Kind> = K extends 'Option'
  ? OptionFoldingKeys
  : K extends 'Either'
    ? EitherFoldingKeys
    : K extends 'Try'
      ? TryFoldingKeys
      : never;

type Folding<K extends Kind, Acceptable, Unacceptable, T> = {
  [success in Pair<K>[0]]: (value: Acceptable) => T;
} & { [failure in Pair<K>[1]]: (value: Unacceptable) => T };

interface Railway<Acceptable, Unacceptable> {
  andThen<R>(f: (value: Acceptable) => Railway<R, Unacceptable>): Railway<R, Unacceptable>;
  orElse<R>(f: (value: Unacceptable) => Railway<Acceptable, R>): Railway<Acceptable, R>;
  fold<R>(folding: Folding<Kind, Acceptable, Unacceptable, R>): R;
  combineWith<T extends unknown[]>(others: Railway<unknown, Unacceptable>[]): Railway<[Acceptable, ...T], Unacceptable>;
}

export { Railway, Folding };
