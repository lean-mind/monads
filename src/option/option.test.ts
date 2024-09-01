import { describe, expect, it } from 'vitest';
import { None, Option, Some } from './option';

describe('Option monad', () => {
  it.each([
    { type: 'Some', value: 2, expected: new Some(2) },
    { type: 'None', value: undefined, expected: new None() },
  ])('should create $type correctly', ({ value, expected }) => {
    expect(Option.of(value)).toEqual(expected);
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
    { type: 'Some', option: Option.of(2), closure: (x: number) => x * 2, expected: new Some(4) },
    { type: 'None', option: Option.of<number>(undefined), closure: (x: number) => x * 2, expected: new None() },
  ])('$type should handle map operation correctly', ({ option, closure, expected }) => {
    expect(option.map(closure)).toEqual(expected);
  });

  it.each([
    { type: 'Some', option: Option.of(2), closure: (x: number) => Option.of(x * 2), expected: new Some(4) },
    {
      type: 'None',
      option: Option.of<number>(undefined),
      closure: (x: number) => Option.of(x * 2),
      expected: new None(),
    },
  ])('$type should handle flatMap operation correctly', ({ option, closure, expected }) => {
    expect(option.flatMap(closure)).toEqual(expected);
  });

  it.each([
    { type: 'Some', option: Option.of(2), expected: 2 },
    { type: 'None', option: Option.of<number>(undefined), expected: 2 },
  ])('$type should handle match operation correctly', ({ option, expected }) => {
    expect(
      option.match(
        (x) => x,
        () => 2
      )
    ).toEqual(expected);
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
});
