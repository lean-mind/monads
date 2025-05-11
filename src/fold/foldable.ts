type Kind = 'Option' | 'Either' | 'Try';

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

export type Folding<K extends Kind, H, W, T> = {
  [success in Pair<K>[0]]: (value: H) => T;
} & { [failure in Pair<K>[1]]: (value: W) => T };

export interface Foldable<H, W> {
  fold<R>(folding: Folding<Kind, H, W, R>): R;
}
