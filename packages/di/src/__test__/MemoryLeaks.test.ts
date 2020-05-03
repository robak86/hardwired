// https://www.npmjs.com/search?q=keywords:memory%20leak

import { module } from '../index';

describe.skip(`MemoryLeaks`, () => {
  describe(`.checkout`, () => {
    it(`doesn't cause memory leaks`, async () => {
      const m = module('sdf');
      //   let m1 = module('m1')
      //     .define('s3', () => 123)
      //     .define('s4', () => 456);
      //
      //   let m2 = module('m2')
      //     .import('m1', m1)
      //     .define('s1', () => 678)
      //     .define('s2', () => 9)
      //     .define('s3_s1', c => [c.m1.s3, c.s1])
      //     .define('s4_s2', c => [c.m1.s4, c.s2]);
      //
      //   iterate(() => {
      //     container(m2, {}).get('s3_s1');
      //   });
      // }).timeout(10000);
    });
  });
});
