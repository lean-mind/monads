import { describe, it, expect } from 'vitest';
import { Either } from '../either';
import { Option } from '../option';
import { Try } from '../try';

const testCasesMonadMapOperation = [
  {
    type: 'Either Right',
    monad: Either.right(2),
    closure: (x: number) => x * 2,
    expected: Either.right(4),
  },
  {
    type: 'Either Left',
    monad: Either.left(2),
    closure: (x: number) => x * 2,
    expected: Either.left(2),
  },
  {
    type: 'Option Some',
    monad: Option.of(2),
    closure: (x: number) => x * 2,
    expected: Option.of(4),
  },
  {
    type: 'Option None',
    monad: Option.of<number>(undefined),
    closure: (x: number) => x * 2,
    expected: Option.of<number>(undefined),
  },
  {
    type: 'Try Success',
    monad: Try.execute(() => 2),
    closure: (x: number) => x * 2,
    expected: Try.execute(() => 4),
  },
  {
    type: 'Try Failure',
    monad: Try.execute(() => {
      throw new Error('Error');
    }),
    closure: (x: number) => x * 2,
    expected: Try.execute(() => {
      throw new Error('Error');
    }),
  },
];

const testCasesMonadFlatMapOperation = [
  {
    type: 'Either Right',
    monad: Either.right(2),
    closure: (x: number) => Either.right(x * 2),
    expected: Either.right(4),
  },
  {
    type: 'Either Left',
    monad: Either.left(2),
    closure: (x: number) => Either.right(x * 2),
    expected: Either.left(2),
  },
  {
    type: 'Option Some',
    monad: Option.of(2),
    closure: (x: number) => Option.of(x * 2),
    expected: Option.of(4),
  },
  {
    type: 'Option None',
    monad: Option.of<number>(undefined),
    closure: (x: number) => Option.of(x * 2),
    expected: Option.of<number>(undefined),
  },
  {
    type: 'Try Success',
    monad: Try.execute(() => 2),
    closure: (x: number) => Try.execute(() => x * 2),
    expected: Try.execute(() => 4),
  },
  {
    type: 'Try Failure',
    monad: Try.execute(() => {
      throw new Error('Error');
    }),
    closure: (x: number) => Try.execute(() => x * 2),
    expected: Try.execute(() => {
      throw new Error('Error');
    }),
  },
];

describe('Monad', () => {
  it.each(testCasesMonadMapOperation)('$type Monad should handle map correctly', ({ monad, closure, expected }) => {
    expect(monad.map(closure)).toEqual(expected);
  });

  it.each(testCasesMonadFlatMapOperation)(
    '$type Monad should handle flatMap correctly',
    ({ monad, closure, expected }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // the closure can be different for each monad but in the end the behavior is the same
      expect(monad.flatMap(closure)).toEqual(expected);
    }
  );
});
