type Kind = 'Option' | 'Either' | 'Try';

type OptionFoldingKeys = ['ifSome', 'ifNone'];
type EitherFoldingKeys = ['ifRight', 'ifLeft'];
type TryFoldingKeys = ['ifSuccess', 'ifFailure'];

type Pair<K extends Kind> = K extends 'Option'
  ? OptionFoldingKeys
  : K extends 'Either'
    ? EitherFoldingKeys
    : K extends 'Try'
      ? TryFoldingKeys
      : never;

type Folding<K extends Kind, Acceptable, Unacceptable, T> = {
  [success in Pair<K>[0]]: (value: Acceptable) => T;
} & { [failure in Pair<K>[1]]: (value: Unacceptable) => T };

interface Foldable<Acceptable, Unacceptable> {
  fold<T>(folding: Folding<Kind, Acceptable, Unacceptable, T>): T;
}

export { Foldable, Folding, Kind };
