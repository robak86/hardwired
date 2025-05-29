import { configureScope, container } from 'hardwired';
import { describe, vi } from 'vitest';

import { fn } from '../fn.js';
import { withContainer } from '../asyncContainerStorage.js';
import { withScope } from '../withScope.js';

describe(`fn`, () => {
  describe(`transient`, () => {
    const sumFn = fn((a: number, b: number) => a + b);

    it(`acts as a normal function`, async () => {
      expect(sumFn(1, 2)).toEqual(3);
    });

    it(`acts as normal definition`, async () => {
      const cnt = container(c => {
        c.add(sumFn).static(10);
      });

      expect(cnt.use(sumFn).trySync()).toEqual(10);
    });

    it(`allows overrides`, async () => {
      const cnt = container();

      const result = withContainer(cnt, () => sumFn(1, 2));

      expect(result).toEqual(3);
    });

    it(`allows overrides`, async () => {
      const myFn = fn((a: number, b: number) => a + b);

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

      const myFn = fn(spyFn);

      const cnt = container(c => {
        c.modify(myFn).static(10);
      });

      const result = withContainer(cnt, () => myFn(1, 2));

      expect(result).toEqual(10);
    });
  });

  describe(`scoped`, () => {
    describe(`sync`, () => {
      describe(`without a container`, () => {
        it(`acts as normal function`, async () => {
          const myFn = fn.scoped(() => Math.random());

          expect(myFn()).not.toEqual(myFn());
        });
      });

      describe(`within container context`, () => {
        it(`acts as scoped definition`, async () => {
          const myFn = fn.scoped(() => Math.random());

          expect(myFn()).toBeTypeOf(`number`);

          const cnt = container();
          const [val1, val2] = withContainer(cnt, () => [myFn(), myFn()]);

          expect(val1).toEqual(val2);
        });
      });

      describe(`overrides`, () => {
        it(`allows overrides`, async () => {
          const myFn = fn.scoped(() => Math.random());

          const cnt = container(c => {
            c.modify(myFn).static(10);
          });

          const result = withContainer(cnt, () => myFn());

          expect(result).toEqual(10);
        });
      });
    });

    describe(`async`, () => {
      describe(`without a container`, () => {
        it(`acts as normal function`, async () => {
          const myFn = fn.scoped(async () => Math.random());

          expect(await myFn()).not.toEqual(await myFn());
        });
      });

      describe(`within container context`, () => {
        it(`acts as scoped definition`, async () => {
          const myFn = fn.scoped(async () => Math.random());

          expect(await myFn()).toBeTypeOf(`number`);

          const cnt = container();
          const [val1, val2] = await withContainer(cnt, async () => [await myFn(), await myFn()]);

          expect(val1).toBeTypeOf('number');
          expect(val1).toBe(val2);
        });
      });

      describe(`overrides`, () => {
        it(`allows overrides`, async () => {
          const myFn = fn.scoped(async () => Math.random());

          const cnt = container(c => {
            c.modify(myFn).static(Promise.resolve(10));
          });

          const result = await withContainer(cnt, async () => myFn());

          expect(result).toEqual(10);
        });
      });
    });

    describe(`cascading`, () => {
      describe(`sync`, () => {
        it(`acts as cascading`, async () => {
          const myFn = fn.cascading(() => Math.random());

          expect(myFn()).toBeTypeOf(`number`);

          const cnt = container();
          const scopeConfig = configureScope(c => c.modify(myFn).claimNew());
          const scopeConfig2 = configureScope(c => c.modify(myFn).static(10));

          const [val1, val2, [val3, val4], val5] = withContainer(cnt, () => {
            return [
              myFn(),
              myFn(),
              withScope(scopeConfig, () => [myFn(), myFn()]),
              withScope(scopeConfig2, () => myFn()),
            ];
          });

          expect(val1).toEqual(val2);
          expect(val3).toEqual(val4);
          expect(val1).not.toEqual(val3);
          expect(val5).toEqual(10);
        });
      });
    });
  });
});
