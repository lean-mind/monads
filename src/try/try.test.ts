import { describe, it, expect } from 'vitest';
import { Failure, Success, Try } from './try';

describe('Try monad', () => {
  it.each([
    { type: 'Success', executable: () => 2, expected: new Success(2) },
    {
      type: 'Failure',
      executable: () => {
        throw new Error();
      },
      expected: new Failure(new Error()),
    },
  ])('should create $type correctly', ({ executable, expected }) => {
    expect(Try.execute(executable)).toEqual(expected);
  });

  it.each([
    { type: 'Success', tryMonad: Try.execute(() => 2), expected: false },
    {
      type: 'Failure',
      tryMonad: Try.execute(() => {
        throw new Error();
      }),
      expected: true,
    },
  ])('$type should handle isFailure operation correctly', ({ tryMonad, expected }) => {
    expect(tryMonad.isFailure()).toEqual(expected);
  });

  it.each([
    { type: 'Success', tryMonad: Try.execute(() => 2), expected: true },
    {
      type: 'Failure',
      tryMonad: Try.execute(() => {
        throw new Error();
      }),
      expected: false,
    },
  ])('$type should handle isSuccess operation correctly', ({ tryMonad, expected }) => {
    expect(tryMonad.isSuccess()).toEqual(expected);
  });
});
