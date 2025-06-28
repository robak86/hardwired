import { describe, expect } from 'vitest';
import { configureScope, container, scoped } from 'hardwired';

import { getCurrentContainer, withContainer } from '../asyncContainerStorage.js';
import { withScope } from '../withScope.js';
import { use } from '../use.js';
import { asDefinition } from '../asDefinition.js';

import { it } from './helpers/test-case.js';

describe(`useContainer`, () => {
  it(`returns default global container if not run within a container context`, async () => {
    const c1 = getCurrentContainer();
    const c2 = getCurrentContainer();

    expect(c1).toBe(c2);
  });

  it(`returns local container instance if run within withLocalContainer's callback`, async () => {
    const c1 = getCurrentContainer();
    const c2 = withContainer(container(), () => getCurrentContainer());

    expect(c1).not.toBe(c2);
    expect(c2.parentId).not.toEqual(c1.id);
  });
});

describe(`withScope`, () => {
  // TODO: there is a bug in container related to multiple configurations. They are not applicative
  describe.todo(`multiple configs`, () => {
    it(`accepts multiple configurations`, async () => {
      const myFn = asDefinition(() => -1);

      const c1 = configureScope(c => {
        c.modify(myFn).static(0);

        c.modify(myFn).decorate(val => val + 1);
      });
      const c2 = configureScope(c => c.modify(myFn).decorate(val => val + 1));

      const cnt = container();

      const val = withContainer(cnt, () => {
        return withScope(c1, c2, () => use(myFn));
      });

      expect(val).toEqual(2);
    });
  });

  describe(`wrapped with local container`, () => {
    it(`returns scoped container that is a child of local container`, async () => {
      const c0 = getCurrentContainer();
      const [c1, c2] = withContainer(container(), () => {
        const c1 = getCurrentContainer();
        const c2 = withScope(() => getCurrentContainer());

        return [c1, c2];
      });

      expect(c2.parentId).toEqual(c1.id);
      expect(c0.id).not.toEqual(c1.id);
      expect(c0.id).not.toEqual(c2.id);
    });
  });

  describe(`not wrapped with local container`, () => {
    it(`returns scoped container that is a child of global container`, async () => {
      const c1 = getCurrentContainer();
      const c2 = withScope(() => getCurrentContainer());
      const c3 = withScope(() => getCurrentContainer());

      expect(c2.parentId).toEqual(c1.id);
      expect(c3.parentId).toEqual(c1.id);
    });
  });

  describe(`overrides are not promoted to the parent container`, () => {
    it(`returns correct instance when operating on the root container`, async c => {
      const valD = scoped.token<number>();

      const innerConfig = configureScope(c => {
        c.modify(valD).fn(() => 10);
      });

      const outerConfig = configureScope(async c => {
        c.modify(valD).fn(() => 0);
      });

      const [outer, inner] = await withScope(outerConfig, async () => {
        return [
          use(valD),
          withScope(innerConfig, () => {
            return use(valD);
          }),
        ];
      });

      expect(outer).toEqual(0);
      expect(inner).toEqual(10);
    });
  });
});
