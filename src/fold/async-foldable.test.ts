import { describe, expect, it } from 'vitest';
import { AsyncEither } from '../either';

describe('AsyncFoldable', () => {
  it.each(foldTestCases)(
    'AsyncEither $type should handle fold operation correctly',
    async ({ foldable, folding, expected }) => {
      const result = await foldable.fold(folding);
      expect(result).toEqual(expected);
    }
  );
});

const foldTestCases = [
  {
    type: 'Right',
    foldable: AsyncEither.fromSafePromise<string, number>(Promise.resolve(2)),
    folding: {
      ifRight: (value: number) => `value: ${value}`,
      ifLeft: (e: string) => e + '!',
    },
    expected: 'value: 2',
  },
  {
    type: 'Left',
    foldable: AsyncEither.fromPromise<string, number>(Promise.reject('error'), (error) => error as string),
    folding: {
      ifRight: (value: number) => `value: ${value}`,
      ifLeft: (e: string) => e + '!',
    },
    expected: 'error!',
  },
];
