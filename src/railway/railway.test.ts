import { describe, expect, it } from 'vitest';
import { Try } from '../try';
import { Either } from '../either';
import { Option } from '../option';

describe('Railway', () => {
  it.each(foldTestCases)('$type should handle fold operation correctly', ({ railway, folding, expected }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(railway.fold(folding)).toEqual(expected);
  });
  it.each(andThenTestCases)('$type should handle andThen operation correctly', ({ railway, operation, expected }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(railway.andThen(operation)).toEqual(expected);
  });
  it.each(orElseTestCases)('$type should handle orElse operation correctly', ({ railway, operation, expected }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(railway.orElse(operation)).toEqual(expected);
  });
});

const foldTestCases = [
  {
    type: 'Either Right',
    railway: Either.right<number, number>(2),
    folding: {
      ifRight: (x: number) => x * 2,
      ifLeft: (_: number) => 2,
    },
    expected: 4,
  },
  {
    type: 'Either Left',
    railway: Either.left<number, number>(2),
    folding: {
      ifRight: (_: number) => 2,
      ifLeft: (x: number) => x * 2,
    },
    expected: 4,
  },
  {
    type: 'Try Success',
    railway: Try.success(2),
    folding: {
      ifSuccess: (x: number) => x * 2,
      ifFailure: (_: Error) => 2,
    },
    expected: 4,
  },
  {
    type: 'Try Failure',
    railway: Try.failure<number>(new Error('fail')),
    folding: {
      ifSuccess: (_: number) => 2,
      ifFailure: (e: Error) => e.message,
    },
    expected: 'fail',
  },
  {
    type: 'Option Some',
    railway: Option.of(2),
    folding: {
      ifSome: (x: number) => x * 2,
      ifNone: () => 2,
    },
    expected: 4,
  },
  {
    type: 'Option None',
    railway: Option.of<number>(undefined),
    folding: {
      ifSome: (_: number) => 2,
      ifNone: (x: undefined) => x,
    },
    expected: undefined,
  },
];

const andThenTestCases = [
  {
    type: 'Either Right',
    railway: Either.right<number, number>(2),
    operation: (x: number) => Either.right(x * 2),
    expected: Either.right(4),
  },
  {
    type: 'Either Left',
    railway: Either.left<number, number>(2),
    operation: (x: number) => Either.right(x * 2),
    expected: Either.left(2),
  },
  {
    type: 'Try Success',
    railway: Try.success(2),
    operation: (x: number) => Try.success(x * 2),
    expected: Try.success(4),
  },
  {
    type: 'Try Failure',
    railway: Try.failure<number>(new Error('fail')),
    operation: (x: number) => Try.success(x * 2),
    expected: Try.failure(new Error('fail')),
  },
  {
    type: 'Option Some',
    railway: Option.of(2),
    operation: (x: number) => Option.of(x * 2),
    expected: Option.of(4),
  },
  {
    type: 'Option None',
    railway: Option.of<number>(undefined),
    operation: (x: number) => Option.of(x * 2),
    expected: Option.of(undefined),
  },
];

const orElseTestCases = [
  {
    type: 'Either Right',
    railway: Either.right<number, number>(2),
    operation: (x: number) => Either.left(x * 2),
    expected: Either.right(2),
  },
  {
    type: 'Either Left',
    railway: Either.left<number, number>(2),
    operation: (x: number) => Either.left(x * 2),
    expected: Either.left(4),
  },
  {
    type: 'Try Success',
    railway: Try.success(2),
    operation: () => Try.failure(new Error('fail')),
    expected: Try.success(2),
  },
  {
    type: 'Try Failure',
    railway: Try.failure<number>(new Error('fail')),
    operation: () => Try.failure(new Error('fail')),
    expected: Try.failure(new Error('fail')),
  },
  {
    type: 'Option Some',
    railway: Option.of(2),
    operation: (x: number) => Option.of(x * 2),
    expected: Option.of(2),
  },
  {
    type: 'Option None',
    railway: Option.of<number>(undefined),
    operation: () => Option.of(2),
    expected: Option.of(2),
  },
];
