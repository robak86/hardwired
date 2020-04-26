import { expect } from 'chai';
import { module } from '@hardwired/di';

describe(`It works`, () => {
  it(`does not not`, async () => {
    const m = module('m1').defineConst('a', 'a');
    expect(m.toContainer({}).get('a')).to.eq('a');
  });
});
