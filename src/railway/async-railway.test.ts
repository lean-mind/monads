import { describe, expect, it, vi } from 'vitest';
import { AsyncEither } from '../either';

describe('AsyncRailway', () => {
  it.each(andThenTestCases)(
    'AsyncEither $type should handle andThen operation correctly',
    async ({ railway, operation, expected }) => {
      const result = await railway.andThen(operation).fold({
        ifRight: (value) => `value: ${value}`,
        ifLeft: (error) => error,
      });

      expect(result).toBe(expected);
    }
  );

  it.each(orElseTestCases)(
    'AsyncEither $type should handle orElse operation correctly',
    async ({ railway, operation, expected }) => {
      const result = await railway.orElse(operation).fold({
        ifRight: (value) => `value: ${value}`,
        ifLeft: (error) => error,
      });

      expect(result).toBe(expected);
    }
  );

  describe('withTimeout', () => {
    it('should resolve normally when completing before timeout', async () => {
      const asyncEither = AsyncEither.fromSafePromise<string, number>(Promise.resolve(2));
      const timeoutEither = asyncEither.withTimeout(100, () => 'Timeout error');

      const result = await timeoutEither.fold({
        ifRight: (value) => `value: ${value}`,
        ifLeft: (error) => error,
      });

      expect(result).toEqual('value: 2');
    });

    it('should trigger timeout when operation takes too long', async () => {
      vi.useFakeTimers();

      // Create a slow AsyncEither that resolves after 200ms
      const slowPromise = new Promise<number>((resolve) => setTimeout(() => resolve(42), 200));
      const slowAsyncEither = AsyncEither.fromPromise<string, number>(slowPromise, (error) => String(error));

      const timeoutEither = slowAsyncEither.withTimeout(50, () => 'Timeout error');

      // Advance timers and wait for resolution
      const resultPromise = timeoutEither.fold({
        ifRight: (value) => `value: ${value}`,
        ifLeft: (error) => error,
      });

      vi.advanceTimersByTime(100);
      const result = await resultPromise;

      expect(result).toEqual('Timeout error');

      vi.useRealTimers();
    });
  });
});

const andThenTestCases = [
  {
    type: 'Right',
    railway: AsyncEither.fromSafePromise<string, number>(Promise.resolve(2)),
    operation: (x: number) => AsyncEither.fromSafePromise<string, number>(Promise.resolve(x * 2)),
    expected: 'value: 4',
  },
  {
    type: 'Left',
    railway: AsyncEither.fromSafePromise<string, number>(Promise.resolve(2)),
    operation: (_: number) =>
      AsyncEither.fromPromise<string, number>(Promise.reject('error'), (error) => error as string),
    expected: 'error',
  },
];

const orElseTestCases = [
  {
    type: 'Right',
    railway: AsyncEither.fromSafePromise<string, number>(Promise.resolve(2)),
    operation: (_: string) => AsyncEither.fromSafePromise<string, number>(Promise.resolve(42)),
    expected: 'value: 2',
  },
  {
    type: 'Left',
    railway: AsyncEither.fromPromise<string, number>(Promise.reject('error'), (error) => error as string),
    operation: (_: string) => AsyncEither.fromSafePromise<string, number>(Promise.resolve(42)),
    expected: 'value: 42',
  },
];
