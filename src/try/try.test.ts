import { describe, expect, it, vi } from 'vitest';
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

  it('should retrieve the value from Success', () => {
    const success = Try.success(2);
    expect(success.getOrThrow()).toEqual(2);
    expect(success.getOrElse(3)).toEqual(2);
  });

  it('should throw an error when retrieving the value from Failure', () => {
    const failure = Try.failure(new Error('An error occurred'));
    expect(() => failure.getOrThrow()).toThrowError(new Error('An error occurred'));
  });

  it('should retrieve a default value from Failure', () => {
    const failure = Try.failure(new Error('An error occurred'));
    expect(failure.getOrElse(3)).toEqual(3);
  });

  it('should execute an action if is a Success', () => {
    const action = vi.fn();
    Try.success(2).onSuccess(action);
    expect(action).toHaveBeenCalledWith(2);

    const nonCallableAction = vi.fn();
    Try.failure(new Error('error')).onSuccess(nonCallableAction);
    expect(nonCallableAction).not.toHaveBeenCalled();
  });

  it('should execute an action if is a Failure', () => {
    const action = vi.fn();
    Try.failure(new Error('error')).onFailure(action);
    expect(action).toHaveBeenCalledWith(new Error('error'));

    const nonCallableAction = vi.fn();
    Try.success(2).onFailure(nonCallableAction);
    expect(nonCallableAction).not.toHaveBeenCalled();
  });
});
