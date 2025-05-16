import { describe, expect, it } from 'vitest';
import { Either } from '../either';
import { Try } from '../try';
import { Option } from '../option';

describe('Foldable', () => {
  it.each(foldTestCases)('$type should handle fold operation correctly', ({ foldable, folding, expected }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(foldable.fold(folding)).toEqual(expected);
  });
});

const foldTestCases = [
  {
    type: 'Either Right',
    foldable: Either.right<number, number>(2),
    folding: {
      ifRight: (x: number) => x * 2,
      ifLeft: (_: number) => 2,
    },
    expected: 4,
  },
  {
    type: 'Either Left',
    foldable: Either.left<number, number>(2),
    folding: {
      ifRight: (_: number) => 2,
      ifLeft: (x: number) => x * 2,
    },
    expected: 4,
  },
  {
    type: 'Try Success',
    foldable: Try.success(2),
    folding: {
      ifSuccess: (x: number) => x * 2,
      ifFailure: (_: Error) => 2,
    },
    expected: 4,
  },
  {
    type: 'Try Failure',
    foldable: Try.failure<number>(new Error('fail')),
    folding: {
      ifSuccess: (_: number) => 2,
      ifFailure: (e: Error) => e.message,
    },
    expected: 'fail',
  },
  {
    type: 'Option Some',
    foldable: Option.of(2),
    folding: {
      ifSome: (x: number) => x * 2,
      ifNone: () => 2,
    },
    expected: 4,
  },
  {
    type: 'Option None',
    foldable: Option.of<number>(undefined),
    folding: {
      ifSome: (_: number) => 2,
      ifNone: (x: undefined) => x,
    },
    expected: undefined,
  },
];
