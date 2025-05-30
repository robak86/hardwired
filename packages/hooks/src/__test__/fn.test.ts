import { container } from 'hardwired';
import { describe, vi } from 'vitest';

import { asDefinition } from '../asDefinition.js';
import { withContainer } from '../asyncContainerStorage.js';

describe(`fn`, () => {
  describe(`transient`, () => {
    const sumFn = asDefinition((a: number, b: number) => a + b);

    it(`acts as a normal function`, async () => {
      expect(sumFn(1, 2)).toEqual(3);
    });

    it(`acts as normal definition`, async () => {
      const cnt = container(c => {
        c.add(sumFn).static(10);
      });

      expect(cnt.use(sumFn)).toEqual(10);
    });

    it(`allows overrides`, async () => {
      const cnt = container();

      const result = withContainer(cnt, () => sumFn(1, 2));

      expect(result).toEqual(3);
    });

    it(`allows overrides`, async () => {
      const myFn = asDefinition((a: number, b: number) => a + b);

      const cnt = container(c => {
        c.modify(myFn).static(10);
      });

      const result = withContainer(cnt, () => myFn(1, 2));

      expect(result).toEqual(10);
    });

    it(`supports decorate`, async () => {
      const cnt = container(c => {
        c.modify(sumFn).decorate(val => val + 5);
      });

      const result = withContainer(cnt, () => sumFn(1, 2));

      expect(result).toEqual(8);
    });

    it(`supports static`, async () => {
      const spyFn = vi.fn((a: number, b: number) => a + b);

      const myFn = asDefinition(spyFn);

      const cnt = container(c => {
        c.modify(myFn).static(10);
      });

      const result = withContainer(cnt, () => myFn(1, 2));

      expect(result).toEqual(10);
    });
  });
});
