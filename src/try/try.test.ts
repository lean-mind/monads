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
    expect(Try.toExecute(executable)).toEqual(expected);
  });

  it.each([
    { type: 'Success', tryMonad: Try.toExecute(() => 2), closure: (x: number) => x * 2, expected: new Success(4) },
    {
      type: 'Failure',
      tryMonad: Try.toExecute(() => {
        throw new Error();
      }),
      closure: (x: number) => x * 2,
      expected: new Failure(new Error()),
    },
  ])('$type should handle map operation correctly', ({ tryMonad, closure, expected }) => {
    expect(tryMonad.map(closure)).toStrictEqual(expected);
  });

  it.each([
    {
      type: 'Success',
      tryMonad: Try.toExecute(() => 2),
      closure: (x: number) => Try.toExecute(() => 2 * 2),
      expected: new Success(4),
    },
    {
      type: 'Failure',
      tryMonad: Try.toExecute(() => {
        throw new Error();
      }),
      closure: (x: number) => Try.toExecute(() => 2 * 2),
      expected: new Failure(new Error()),
    },
  ])('$type should handle flatMap operation correctly', ({ tryMonad, closure, expected }) => {
    expect(tryMonad.flatMap(closure)).toEqual(expected);
  });

  it.each([
    {
      type: 'Success',
      tryMonad: Try.toExecute(() => '2'),
      closure: (x: string) => Try.toExecute(() => x + '2'),
      expected: new Success('2'),
    },
    {
      type: 'Failure',
      tryMonad: Try.toExecute(() => {
        throw new Error('Error: ');
      }),
      closure: (error: Error) => Try.toExecute(() => {throw new Error(error.message + 'description')}),
      expected: new Failure(new Error('Error: description')),
    },
  ])('$type should handle flatMapLeft operation correctly', ({ tryMonad, closure, expected }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ignore
    // @ts-expect-error
    expect(tryMonad.flatMapLeft(closure)).toEqual(expected);
  });

  it.each([
    { type: 'Success', tryMonad: Try.toExecute(() => 2), expected: 2 },
    {
      type: 'None',
      tryMonad: Try.toExecute(() => {
        throw new Error();
      }),
      expected: 2,
    },
  ])('$type should handle match operation correctly', ({ tryMonad, expected }) => {
    expect(
      tryMonad.match(
        (x) => x,
        () => 2
      )
    ).toEqual(expected);
  });

  it.each([
    { type: 'Success', tryMonad: Try.toExecute(() => 2), expected: false },
    {
      type: 'Failure',
      tryMonad: Try.toExecute(() => {
        throw new Error();
      }),
      expected: true,
    },
  ])('$type should handle isFailure operation correctly', ({ tryMonad, expected }) => {
    expect(tryMonad.isFailure()).toEqual(expected);
  });

  it.each([
    { type: 'Success', tryMonad: Try.toExecute(() => 2), expected: true },
    {
      type: 'Failure',
      tryMonad: Try.toExecute(() => {
        throw new Error();
      }),
      expected: false,
    },
  ])('$type should handle isSuccess operation correctly', ({ tryMonad, expected }) => {
    expect(tryMonad.isSuccess()).toEqual(expected);
  });
});
