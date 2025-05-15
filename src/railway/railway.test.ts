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

  it.each(combineWithTestCases)(
    '$type should handle combineWith operation correctly',
    ({ railway, others, expected }) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      expect(railway.combineWith(others)).toEqual(expected);
    }
  );
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

const combineWithTestCases = [
  {
    type: 'Either Right with Rights',
    railway: Either.right<string, number>(2),
    others: [Either.right<string, string>('test'), Either.right<string, boolean>(true)],
    expected: Either.right([2, 'test', true]),
  },
  {
    type: 'Either Right with Left',
    railway: Either.right<string, number>(2),
    others: [Either.right<string, string>('test'), Either.left<string, boolean>('error')],
    expected: Either.left('error'),
  },
  {
    type: 'Either Left with others',
    railway: Either.left<string, number>('initial error'),
    others: [Either.right<string, string>('test'), Either.right<string, boolean>(true)],
    expected: Either.left('initial error'),
  },
  {
    type: 'Try Success with Successes',
    railway: Try.success(2),
    others: [Try.success('test'), Try.success(true)],
    expected: Try.success([2, 'test', true]),
  },
  {
    type: 'Try Success with Failure',
    railway: Try.success(2),
    others: [Try.success('test'), Try.failure(new Error('error'))],
    expected: Try.failure(new Error('error')),
  },
  {
    type: 'Try Failure with others',
    railway: Try.failure<number>(new Error('initial error')),
    others: [Try.success('test'), Try.success(true)],
    expected: Try.failure(new Error('initial error')),
  },
  {
    type: 'Option Some with Somes',
    railway: Option.of(2),
    others: [Option.of('test'), Option.of(true)],
    expected: Option.of([2, 'test', true]),
  },
  {
    type: 'Option Some with None',
    railway: Option.of(2),
    others: [Option.of('test'), Option.of<boolean>(undefined)],
    expected: Option.of(undefined),
  },
  {
    type: 'Option None with others',
    railway: Option.of<number>(undefined),
    others: [Option.of('test'), Option.of(true)],
    expected: Option.of(undefined),
  },
  {
    type: 'Empty array of others',
    railway: Either.right<string, number>(2),
    others: [],
    expected: Either.right([2]),
  },
  {
    type: 'Multiple values combined',
    railway: Either.right<string, number>(1),
    others: [
      Either.right<string, number>(2),
      Either.right<string, number>(3),
      Either.right<string, number>(4),
      Either.right<string, number>(5),
    ],
    expected: Either.right([1, 2, 3, 4, 5]),
  },
];
