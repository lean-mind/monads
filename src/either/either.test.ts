import { describe, expect, it } from 'vitest';
import { Either } from './either';

describe('Either monad', () => {
  it.each([
    { type: 'Right', either: Either.right(2), closure: (x: number) => x, expected: Either.right(2) },
    { type: 'Left', either: Either.left(2), closure: (x: number) => x * 2, expected: Either.left(2) },
  ])('$type should handle map operation correctly', ({ either, closure, expected }) => {
    expect(either.map(closure)).toEqual(expected);
  });

  it.each([
    { type: 'Right', either: Either.right(2), closure: (x: number) => x, expected: Either.right(2) },
    { type: 'Left', either: Either.left(2), closure: (x: number) => x * 2, expected: Either.left(4) },
  ])('$type should handle mapLeft operation correctly', ({ either, closure, expected }) => {
    expect(either.mapLeft(closure)).toEqual(expected);
  });

  it.each([
    { type: 'Right', either: Either.right(2), closure: (x: number) => Either.right(x), expected: Either.right(2) },
    { type: 'Left', either: Either.left(2), closure: (x: number) => Either.left(x), expected: Either.left(2) },
  ])('$type should handle flatMap operation correctly', ({ either, closure, expected }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(either.flatMap(closure)).toEqual(expected);
  });

  it.each([
    { type: 'Right', either: Either.right(2), closure: (x: number) => Either.right(x), expected: Either.right(2) },
    { type: 'Left', either: Either.left(2), closure: (x: number) => Either.left(x), expected: Either.left(2) },
  ])('$type should handle flatMapLeft operation correctly', ({ either, closure, expected }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    expect(either.flatMapLeft(closure)).toEqual(expected);
  });

  it.each([
    { type: 'Right', either: Either.right(2), expected: 2 },
    { type: 'Left', either: Either.left('Error'), expected: 'Error' },
  ])('$type should handle match operation correctly', ({ either, expected }) => {
    expect(
      either.match(
        (x) => x,
        (x) => x
      )
    ).toEqual(expected);
  });

  it.each([
    { type: 'Right', either: Either.right(2), expected: false },
    { type: 'Left', either: Either.left('Error'), expected: true },
  ])('$type should handle isLeft operation correctly', ({ either, expected }) => {
    expect(either.isLeft()).toEqual(expected);
  });

  it.each([
    { type: 'Right', either: Either.right(2), expected: true },
    { type: 'Left', either: Either.left('Error'), expected: false },
  ])('$type should handle isRight operation correctly', ({ either, expected }) => {
    expect(either.isRight()).toEqual(expected);
  });
});
