import { describe, expect, it } from 'vitest';
import { useContainer } from '../asyncContainerStorage.js';
import { withContainer } from '../withContainer.js';
import { withScope } from '../withScope.js';

describe(`getContainer`, () => {
  it(`returns default global container if not run within a container context`, async () => {
    const c1 = useContainer();
    const c2 = useContainer();

    expect(c1).toBe(c2);
  });

  it(`returns child container if run within a container context`, async () => {
    const c1 = useContainer();
    const c2 = withContainer(() => useContainer());

    expect(c1).not.toBe(c2);
  });
});

describe(`withScope`, () => {
  describe(`wrapped with local container`, () => {
    it(`returns scoped container that is a child of local container`, async () => {
      const [c1, c2] = withContainer(() => {
        const c1 = useContainer();
        const c2 = withScope(() => useContainer());

        return [c1, c2];
      });

      expect(c2.parentId).toEqual(c1.id);
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
});

describe(`withContainer`, () => {
  describe(`nesting`, () => {
    // it(`reuses the same container`, async () => {
    //   const c0 = getContainer();
    //
    //   const [c1, c2] = withContainer(() => {
    //     const c1 = getContainer();
    //     const c2 = withContainer(() => getContainer());
    //
    //     return [c1, c2];
    //   });
    //
    //   expect(c1).toBe(c2);
    //   expect(c0).not.toBe(c1);
    // });
  });
});
