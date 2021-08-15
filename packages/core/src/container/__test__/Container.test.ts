import { container } from '../Container';
import { module, unit } from '../../module/ModuleBuilder';
import { singleton } from '../../strategies/SingletonStrategy';
import { request } from '../../strategies/RequestStrategy';

describe(`Container`, () => {
  describe(`.get`, () => {
    it(`returns correct value`, async () => {
      const child2 = module()
        .define('c', singleton, () => 'cValue')
        .define('d', singleton, () => 'dValue')
        .build();
      const c = container();

      const cValue = c.get(child2, 'c');
      expect(cValue).toEqual('cValue');
    });

    it(`lazily appends new module if module cannot be found`, async () => {
      const notRegistered = module() // breakme
        .define('a', singleton, () => 1)
        .build();

      const c = container();

      expect(c.get(notRegistered, 'a')).toEqual(1);
    });
  });

  describe(`.replace`, () => {
    describe(`using module.replace`, () => {
      it(`returns replaced value`, async () => {
        const m = module()
          .define('a', singleton, () => 1)
          .build();
        const mPatch = m.replace('a', () => 2);
        expect(container({ scopeOverrides: [mPatch] }).get(m, 'a')).toEqual(2);
      });

      it(`calls provided function with materialized module`, async () => {
        const m = module()
          .define('b', singleton, () => 2)
          .define('a', singleton, () => 1)
          .build();

        const factoryFunctionSpy = jest.fn().mockImplementation(ctx => {
          return () => 3;
        });

        const mPatch = m.replace('a', factoryFunctionSpy);

        const testContainer = container({ scopeOverrides: [mPatch] });
        testContainer.get(m, 'a');

        expect({ ...factoryFunctionSpy.mock.calls[0][0] }).toEqual({ ...testContainer.asObject(m) });
      });

      it(`forbids to reference replaced value from the context`, async () => {
        const m = module()
          .define('b', singleton, () => 2)
          .define('a', singleton, () => 1)
          .build();

        const updated = m.replace('a', ctx => {
          // @ts-expect-error - a shouldn't be available in the ctx to avoid Maximum call stack size exceeded
          ctx.a;
          return singleton(() => 1);
        });
      });

      it(`does not affect other definitions`, async () => {
        const m = module()
          .define('a', singleton, () => 1)
          .define('b', singleton, () => 'b')
          .build();

        const mPatch = m.replace('a', () => 2);
        expect(container({ scopeOverrides: [mPatch] }).get(m, 'b')).toEqual('b');
      });
    });
  });

  describe(`overrides`, () => {
    it(`merges multiple modules patches originated from the same module`, async () => {
      const m = module()
        .define('a', singleton, () => 1)
        .define('b', singleton, () => 2)
        .define('a_plus_b', singleton, ({ a, b }) => a + b)
        .build();

      const c = container({
        scopeOverrides: [
          //breakme
          m.replace('a', () => 10),
          m.replace('b', () => 20),
        ],
      });

      const { a_plus_b } = c.asObject(m);
      expect(a_plus_b).toEqual(30);
    });
  });

  describe(`asObjectMany`, () => {
    it(`returns array of materialized modules`, async () => {
      const m1 = unit()
        .define('a', request, () => 1)
        .build();

      const m2 = unit()
        .define('b', request, () => 2)
        .build();

      const c = container();
      const [{ a }, { b }] = c.asObjectMany(m1, m2);
      expect(a).toEqual(1);
      expect(b).toEqual(2);
    });
  });

  describe(`async definition`, () => {
    it(`properly resolves async definitions`, async () => {
      let counter = 0;
      const u = module()
        .define('k1', singleton, async () => (counter += 1))
        .define('k2', singleton, async () => (counter += 1))
        .define('k3', singleton, async ({ k1, k2 }) => (await k1) + (await k2))
        .build();

      const c = container();
      const { k3 } = c.asObject(u);
      expect(await k3).toEqual(3);
    });

    it(`does not evaluated promise if key is not accessed`, async () => {
      let counter = 0;
      const k1Factory = jest.fn(async () => (counter += 1));
      const k2Factory = jest.fn(async () => (counter += 1));
      const k3Factory = jest.fn(async ({ k1, k2 }) => (await k1) + (await k2));

      const u = module()
        .define('k1', singleton, k1Factory)
        .define('k2', singleton, k2Factory)
        .define('k3', singleton, k3Factory)
        .build();

      const c = container();
      const { k1 } = c.asObject(u);
      const { k1: k1NextRequest } = c.asObject(u);
      expect(k1Factory).toHaveBeenCalledTimes(1);
      expect(k2Factory).not.toHaveBeenCalled();
      expect(k3Factory).not.toHaveBeenCalled();
    });
  });
});
