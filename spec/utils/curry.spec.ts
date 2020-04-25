import { curry } from '../../lib/utils/curry';
import { expect } from 'chai';

describe(`curry`, () => {
  it(`works for multiple args`, async () => {
    const fn = a => b => c => [a, b, c];
    const curried = curry(fn);
    expect(curried(1)(2)(3)).to.eql([1, 2, 3]);
  });
});
