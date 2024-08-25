import { describe, expect, it } from 'vitest';
import { useContainer } from '../asyncContainerStorage.js';
import { withLocalContainer } from '../withLocalContainer.js';
import { withScope } from '../withScope.js';
import { fn, set } from 'hardwired';
import { use } from '../use.js';

describe(`useContainer`, () => {
  it(`returns default global container if not run within a container context`, async () => {
    const c1 = useContainer();
    const c2 = useContainer();

    expect(c1).toBe(c2);
  });

  it(`returns local container instance if run within withLocalContainer's callback`, async () => {
    const c1 = useContainer();
    const c2 = withLocalContainer(() => useContainer());

    expect(c1).not.toBe(c2);
    expect(c2.parentId).not.toEqual(c1.id);
  });
});

describe(`withScope`, () => {
  describe(`wrapped with local container`, () => {
    it(`returns scoped container that is a child of local container`, async () => {
      const c0 = useContainer();
      const [c1, c2] = withLocalContainer(() => {
        const c1 = useContainer();
        const c2 = withScope(() => useContainer());

        return [c1, c2];
      });

      expect(c2.parentId).toEqual(c1.id);
      expect(c0.id).not.toEqual(c1.id);
      expect(c0.id).not.toEqual(c2.id);
    });
  });

  describe(`not wrapped with local container`, () => {
    it(`returns scoped container that is a child of global container`, async () => {
      const c1 = useContainer();
      const c2 = withScope(() => useContainer());
      const c3 = withScope(() => useContainer());

      expect(c2.parentId).toEqual(c1.id);
      expect(c3.parentId).toEqual(c1.id);
    });
  });

  describe(`overrides are not promoted to the parent container`, () => {
    it(`returns correct instance when operating on the root container`, async () => {
      const valD = fn.singleton(() => 10);

      // first, get an instance from child container, to check if it won't be promoted to parent
      const overriddenVal = withScope([set(valD, 0)], () => {
        return use(valD);
      });

      // get an instance from parent container, to check if it's not affected by the override
      const originalVal = use(valD);

      expect(overriddenVal).toEqual(0);
      expect(originalVal).toEqual(10);
    });

    it(`returns correct instance when instantiating from local container`, async () => {
      const valD = fn.singleton(() => 10);

      const [overriddenVal, originalVal] = withLocalContainer(() => {
        // first, get an instance from child container, to check if it won't be promoted to parent
        const overridden = withScope([set(valD, 0)], () => {
          return use(valD);
        });

        // get an instance from parent container, to check if it's not affected by the override
        const originalVal = use(valD);

        return [overridden, originalVal];
      });

      expect(overriddenVal).toEqual(0);
      expect(originalVal).toEqual(10);
    });
  });
});
