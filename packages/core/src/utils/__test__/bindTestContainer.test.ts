import { bindTestContainer } from '../bindTestContainer.js';
import { fn } from '../../definitions/definitions.js';
import { unbound } from '../../definitions/sync/unbound.js';
import { InstanceCreationAware } from '../../container/IContainer.js';

const withContainer = bindTestContainer({
  beforeEach,
  afterEach,
});

describe(`bindTestContainer`, () => {
  describe(`using disposable for testing`, () => {
    const results: number[] = [];
    const def = fn.scoped(() => Math.random());

    const use = withContainer(async (scope, use) => {});

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

    const use = withContainer(
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

  describe(`reusing root container`, () => {
    const usedContainers: InstanceCreationAware[] = [];
    const disposableContainerIds: string[] = [];
    const def = fn.scoped(() => Math.random());
    const use = withContainer(async (scope, use) => {
      usedContainers.push(use);
    });

    it(`uses the same root container in first test case`, async () => {
      use.all(def);
      disposableContainerIds.push(use.id);
    });

    it(`uses the same root container in the send test case`, async () => {
      use(def);
      disposableContainerIds.push(use.id);
    });

    it(`the instances of root container were the same`, async () => {
      expect(usedContainers[0]).toBe(usedContainers[1]);
    });

    it(`the scope instances were different`, async () => {
      expect(disposableContainerIds[0]).not.toBe(disposableContainerIds[1]);
    });
  });
});
