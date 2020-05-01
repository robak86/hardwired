import { curry } from '../curry';

describe(`curry`, () => {
  it(`works for multiple args`, async () => {
    const fn = a => b => c => [a, b, c];
    const curried = curry(fn);
    expect(curried(1)(2)(3)).toEqual([1, 2, 3]);
  });
});
