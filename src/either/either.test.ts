import { describe, expect, it } from 'vitest';
import { Either, Right } from './either';
import { Option } from '../option';

describe('Either monad', () => {
  it.each([
    { type: 'Right', execute: () => 2, expected: Either.right(2) },
    {
      type: 'Left',
      execute: () => {
        throw new Error('Error');
      },
      expected: Either.left(new Error('Error')),
    },
  ])('$type should be created from possible failed action', ({ execute, expected }) => {
    expect(Either.catch(execute)).toEqual(expected);
  });

  it.each([
    { typeMatchable: 'Some', eitherType: 'Right', matchable: Option.of(2), expected: Either.right(2) },
    {
      typeMatchable: 'None',
      eitherType: 'Left',
      matchable: Option.of<number>(undefined),
      expected: Either.left(undefined),
    },
  ])('$eitherType should be created from $typeMatchable', ({ matchable, expected }) => {
    expect(Either.from(matchable)).toEqual(expected);
  });

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
    { type: 'Right', either: Either.right(2), expected: '2' },
    { type: 'Left', either: Either.left('Error'), expected: 'Error' },
  ])('$type should handle match operation correctly', ({ either, expected }) => {
    expect(
      either.match(
        (x) => x.toString(),
        (x) => x
      )
    ).toEqual(expected);
  });

  it.each([
    {
      type: 'Right',
      either: Either.right(2),
      fr: (x: number) => x,
      fl: (x: number) => x.toString(),
      expected: 2,
    },
  ])(
    'Either $type can handle closures to unwrap distinct types of results by algebraic types',
    ({ either, expected, fr, fl }) => {
      expect(either.match<string | number>(fr, fl)).toEqual(expected);
    }
  );

  it.each([
    {
      type: 'Left',
      either: Either.left('Some Error'),
      fr: (x: string) => x,
      fl: (error: string) => `Error: ${error}`,
      expected: 'Error: Some Error',
    },
  ])('Either $type can handle closures to unwrap distinct types of results', ({ either, expected, fr, fl }) => {
    expect(either.match(fr, fl)).toEqual(expected);
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
