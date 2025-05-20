import { describe, expect, it } from 'vitest';

import { container } from '../../container/Container.js';
import { scoped, transient } from '../def-symbol.js';

describe(`define`, () => {
  const ext1 = scoped<number>();
  const ext2 = scoped<string>();

  describe(`instantiation`, () => {
    it(`correctly resolves externals`, async () => {
      const composite = transient<[number, string]>();

      const result = container
        .new(c => {
          c.add(composite).fn((v1, v2) => [v1, v2], ext1, ext2);
        })
        .scope(c => {
          c.add(ext1).static(1);
          c.add(ext2).static('str');
        })
        .use(composite);

      expect(result).toEqual([1, 'str']);
    });
  });
});
