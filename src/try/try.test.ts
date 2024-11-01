import { describe, expect, it } from 'vitest';
import { Failure, Success, Try } from './try';
import { Either } from '../either';
import { Option } from '../option';

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
    { typeMatchable: 'Right', tryType: 'Success', matchable: Either.right(2), expected: new Success(2) },
    {
      typeMatchable: 'Left',
      tryType: 'Failure',
      matchable: Either.left(new Error('An error occurred')),
      expected: new Failure(new Error('An error occurred')),
    },
    {
      typeMatchable: 'Some',
      tryType: 'Success',
      matchable: Option.of(2),
      expected: new Success(2),
    },
    {
      typeMatchable: 'None',
      tryType: 'Failure',
      matchable: Option.of<number>(undefined),
      expected: new Failure(new Error('No error provided')),
    },
  ])('$tryType should be created from $typeMatchable', ({ matchable, expected }) => {
    expect(Try.from(matchable)).toEqual(expected);
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
