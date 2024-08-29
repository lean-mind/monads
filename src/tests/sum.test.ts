import { it, expect } from 'vitest';

import { sum } from '../core/sum';

it('should sum two numbers', () => {
  const result = sum(1, 2);
  const expected = 3;

  expect(result).toBe(expected);
});
