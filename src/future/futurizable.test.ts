import { describe, it, expect } from 'vitest';
import { Either } from '../either';
import { Future } from './future';

const testCasesFutureMapOperation = [
  {
    type: 'Either Right',
    monad: Either.right(2),
    assertion: (futureMonad: Future<number> | Future<string>, expected: Future<number> | Future<string>) => {
      futureMonad.complete(
        (currentValue: number | string) => {
          expected.complete(
            (expectedValue: number | string) => expect(currentValue).toBe(expectedValue),
            (error) => expect(error).toBeUndefined()
          );
        },
        (error) => expect(error).toBeUndefined()
      );
    },
    expected: Future.of(() => Promise.resolve(2)),
  },
  {
    type: 'Either Left',
    monad: Either.left('Error'),
    assertion: (futureMonad: Future<number> | Future<string>, expected: Future<number> | Future<string>) => {
      futureMonad.complete(
        (currentValue: number | string) => {
          expected.complete(
            (expectedValue: number | string) => expect(currentValue).toBe(expectedValue),
            (error) => expect(error).toBeUndefined()
          );
        },
        (error) => expect(error).toBeUndefined()
      );
    },
    expected: Future.of(() => Promise.resolve('Error')),
  },
];

describe('Futurizable', () => {
  it.each(testCasesFutureMapOperation)(
    '$type should handle toFuture correctly',
    async ({ monad, expected, assertion }) => {
      assertion(monad.toFuture(), expected);
    }
  );
});
