import { curry } from '../curry.js';
import { describe, it, expect, vi } from 'vitest';

describe(`curry`, () => {
  it(`works for multiple args`, async () => {
    const fn = (a: any) => (b: any) => (c: any) => [a, b, c];
    const curried = curry(fn);
    expect(curried(1)(2)(3)).toEqual([1, 2, 3]);
  });
});
