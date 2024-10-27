import { describe, expect, it } from 'vitest';
import { None, Option, Some } from './option';
import { Either } from '../either';

describe('Option monad', () => {
  it.each([
    { type: 'Some', value: 2, expected: new Some(2) },
    { type: 'None', value: undefined, expected: new None() },
  ])('should create $type correctly', ({ value, expected }) => {
    expect(Option.of(value)).toEqual(expected);
  });

  it.each([
    { typeMatchable: 'Right', optionType: 'Some', matchable: Either.right(2), expected: Option.of(2) },
    {
      typeMatchable: 'Left',
      optionType: 'None',
      matchable: Either.left(12),
      expected: Option.of<number>(undefined),
    },
  ])('$optionType should be created from $typeMatchable', ({ matchable, expected }) => {
    expect(Option.from(matchable)).toEqual(expected);
  });

  it.each([
    { type: 'Some', option: Option.of(2), expected: 2 },
    { type: 'None', option: Option.of<number>(undefined), expected: 2 },
  ])('$type should handle getOrElse operation correctly', ({ option, expected }) => {
    expect(option.getOrElse(2)).toEqual(expected);
  });

  it.each([
    { type: 'Some', option: Option.of(2), closure: (x: number) => x === 2, expected: new Some(2) },
    { type: 'None', option: Option.of<number>(undefined), closure: (x: number) => x === 2, expected: new None() },
  ])('$type should handle filter operation correctly', ({ option, closure, expected }) => {
    expect(option.filter(closure)).toEqual(expected);
  });

  it.each([
    { type: 'Some', option: Option.of(2), expected: false },
    { type: 'None', option: Option.of<number>(undefined), expected: true },
  ])('$type should handle isNone operation correctly', ({ option, expected }) => {
    expect(option.isNone()).toEqual(expected);
  });

  it.each([
    { type: 'Some', option: Option.of(2), expected: true },
    { type: 'None', option: Option.of<number>(undefined), expected: false },
  ])('$type should handle isSome operation correctly', ({ option, expected }) => {
    expect(option.isSome()).toEqual(expected);
  });

  it('should create a Some', () => {
    expect(Option.ofSome(2)).toEqual(new Some(2));
    expect(Option.ofSome(null)).toEqual(new Some(null));
  });

  it('should create a None', () => {
    expect(Option.ofNone()).toEqual(new None());
  });
});
