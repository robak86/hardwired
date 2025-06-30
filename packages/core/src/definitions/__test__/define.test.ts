import { describe, expect, it } from 'vitest';

import { container } from '../../container/Container.js';
import { scoped, transient } from '../tokens.js';

describe(`define`, () => {
  const ext1 = scoped.token<number>();
  const ext2 = scoped.token<string>();

  describe(`instantiation`, () => {
    it(`correctly resolves externals`, async () => {
      const composite = transient.token<[number, string]>();

      const result = container(c => {
        c.add(composite)
          .using(ext1, ext2)
          .fn((v1, v2) => [v1, v2]);
      })
        .scope(c => {
          c.add(ext1).static(1);
          c.add(ext2).static('str');
        })
        .use(composite);

      expect(result).toEqual([1, 'str']);
      expect(await result).toEqual([1, 'str']);
    });
  });
});
