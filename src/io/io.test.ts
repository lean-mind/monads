import { describe, it, expect, vi } from 'vitest';
import { IO } from './io';

describe('IO Monad', () => {
  it('should create IO monad correctly', () => {
    const spySideEffect = vi.fn();
    const io = IO.of(spySideEffect);

    expect(io).toBeInstanceOf(IO);
    expect(spySideEffect).not.toHaveBeenCalled();
  });

  it('should not execute the side-effect during map operations', () => {
    const spySideEffect = vi.fn();

    IO.of(() => {
      spySideEffect();
      return 1;
    }).map((x) => x * 2);

    expect(spySideEffect).not.toHaveBeenCalled();
  });

  it('should execute the pipeline created with map operations', () => {
    const unsafeOperation = IO.of(() => 2).map((x) => x * 2);
    expect(unsafeOperation.runUnsafe()).toEqual(4);
  });

  it('should not execute any side-effect during flatMap operations', () => {
    const spySideEffect = vi.fn();
    const spySideEffect2 = vi.fn();

    IO.of(() => spySideEffect()).flatMap(() => IO.of(() => spySideEffect2()));

    expect(spySideEffect).not.toHaveBeenCalled();
    expect(spySideEffect2).not.toHaveBeenCalled();
  });

  it('should execute the pipeline created with flatMap operations', () => {
    const unsafeOperation = IO.of(() => 2).flatMap((x) => IO.of(() => x * 2));
    expect(unsafeOperation.runUnsafe()).toEqual(4);
  });
});
