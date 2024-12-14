import { assert, describe, expect, it, vi } from 'vitest';
import { Future } from './future';

describe('Future monad', () => {
  it.each([
    {
      completionType: 'success',
      action: () => Promise.resolve(2),
      expected: {
        ifSuccess: (value: number) => expect(value).toBe(2),
        ifFailure: (_: Error) => assert.fail('Error should not be thrown'),
      },
    },
    {
      completionType: 'failure',
      action: () => Promise.reject<number>(new Error('Error')),
      expected: {
        ifSuccess: () => assert.fail('Value should not be emitted'),
        ifFailure: (error: Error) => expect(error).toEqual(new Error('Error')),
      },
    },
  ])('should handle $completionType completion', async ({ action, expected }) => {
    const future = Future.of(action);
    await future.complete(expected.ifSuccess, expected.ifFailure);
  });

  it.each([
    {
      completionType: 'Success',
      future: Future.of(() => Promise.resolve(2)),
      expected: {
        ifSuccess: (value: number) => expect(value).toBe(4),
        ifFailure: (_: Error) => assert.fail('Error should not be thrown'),
      },
    },
    {
      completionType: 'Failure',
      future: Future.of(() => Promise.reject<number>(new Error('Error'))),
      expected: {
        ifSuccess: () => assert.fail('Value should not be emitted'),
        ifFailure: (error: Error) => expect(error).toEqual(new Error('Error')),
      },
    },
  ])('$completionType completion should handle map correctly', async ({ future, expected }) => {
    const actual = future.map((value) => value * 2);
    await actual.complete(expected.ifSuccess, expected.ifFailure);
  });

  it.each([
    {
      completionType: 'Success',
      future: Future.of(() => Promise.resolve(2)),
      expected: {
        ifSuccess: (value: number) => expect(value).toBe(4),
        ifFailure: (error: Error) => assert.fail('Error should not be thrown'),
      },
    },
    {
      completionType: 'Failure',
      future: Future.of(() => Promise.reject<number>(new Error('Error'))),
      expected: {
        ifSuccess: () => assert.fail('Value should not be emitted'),
        ifFailure: (error: Error) => expect(error).toEqual(new Error('Error')),
      },
    },
  ])('$completionType completion should handle flatMap correctly', async ({ future, expected }) => {
    const actual = future.flatMap((value) => Future.of(() => Promise.resolve(value * 2)));
    await actual.complete(expected.ifSuccess, expected.ifFailure);
  });

  it('should not execute async action when a mapping is performed', async () => {
    const asyncAction = vi.fn(async () => 2);
    const future = Future.of(asyncAction);
    future.map((value) => value * 2);
    expect(asyncAction).not.toHaveBeenCalled();
  });

  it('should not execute async action when a flat mapping is performed', async () => {
    const asyncAction = vi.fn(async () => 2);
    const future = Future.of(asyncAction);
    future.flatMap((value) => Future.of(() => Promise.resolve(value * 2)));
    expect(asyncAction).not.toHaveBeenCalled();
  });
});
