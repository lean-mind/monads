import { describe, it, expect } from 'vitest';
import { Try } from '../try';
import { Either } from '../either';
import { Option } from '../option';

const testsMatchableCases = [
  {
    type: 'Either Right',
    matchable: Either.right(2),
    closureF: (x: number) => x * 2,
    closureG: () => 2,
    expected: 4,
  },
  {
    type: 'Either Left',
    matchable: Either.left(2),
    closureF: () => 2,
    closureG: (x: number) => x * 2,
    expected: 4,
  },
  {
    type: 'Try Success',
    matchable: Try.execute(() => 2),
    closureF: (x: number) => x * 2,
    closureG: () => 2,
    expected: 4,
  },
  {
    type: 'Try Failure',
    matchable: Try.execute(() => {
      throw new Error();
    }),
    closureF: () => 2,
    closureG: (x: Error) => x,
    expected: new Error(),
  },
  {
    type: 'Option Some',
    matchable: Option.of(2),
    closureF: (x: number) => x * 2,
    closureG: () => 2,
    expected: 4,
  },
  {
    type: 'Option None',
    matchable: Option.of<number>(undefined),
    closureF: () => 2,
    closureG: (x: undefined) => x,
    expected: undefined,
  },
];

describe('Matchable', () => {
  it.each(testsMatchableCases)(
    '$type matchable should handle match operation correctly',
    ({ matchable, expected, closureF, closureG }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      // the closures can be different for each monad but in the end the behavior is the same
      expect(matchable.match(closureF, closureG)).toEqual(expected);
    }
  );
});
