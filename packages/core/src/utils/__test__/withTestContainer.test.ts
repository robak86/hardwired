import { withTestContainer } from '../withTestContainer.js';
import { fn } from '../../definitions/definitions.js';
import { unbound } from '../../definitions/sync/unbound.js';

const testContainer = withTestContainer({
  beforeEach,
  afterEach,
});

describe(`withTestContainer`, () => {
  describe(`using disposable for testing`, () => {
    const results: number[] = [];
    const def = fn.scoped(() => Math.random());

    const use = testContainer(async (scope, use) => {});

    it(`uses separate disposable scope per test, first result`, async () => {
      const a = use(def);
      results.push(a);
    });

    it(`uses separate disposable scope per test, first result`, async () => {
      const a = use(def);
      results.push(a);
    });

    it(`returned different values`, async () => {
      expect(results[0]).not.toEqual(results[1]);
    });
  });

  describe(`using async configuration for test disposable`, () => {
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    let onDisposeCalls = 0;
    const onDispose = () => {
      onDisposeCalls += 1;
    };

    const dep1 = fn.scoped(async () => {
      await sleep(100);
      return Math.random();
    });

    const dep2 = fn.scoped(async () => {
      await sleep(100);
      return Math.random();
    });

    const dep3 = unbound<string>();

    const use = testContainer(
      (scope, use) => {
        scope.bindCascading(dep3).toValue('test');
        scope.onDispose(onDispose);
      },
      async (scope, use) => {
        const value = await use(dep1);

        scope.bindCascading(dep1).toValue(Math.round(value * 100 + 1));
        scope.onDispose(onDispose);
      },
      async (scope, use) => {
        const value = await use(dep1);

        scope.bindCascading(dep2).toValue(Math.round(value * 100 + 1));
        scope.onDispose(onDispose);
      },
    );

    it(`uses separate disposable scope per test, first result`, async () => {
      const dep1Val = await use(dep1);
      const dep2Val = await use.use(dep2);
      const dep3Val = use.use(dep3);

      expect(dep1Val).toBeGreaterThan(0);
      expect(dep1Val).toBeLessThan(101);
      expect(dep2Val).toEqual(dep1Val);
      expect(dep3Val).toEqual('test');
    });

    it(`called onDispose`, async () => {
      expect(onDisposeCalls).toEqual(3);
    });
  });
});
