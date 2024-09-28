import { describe } from 'vitest';
import { fn } from '../../definitions/definitions.js';
import { container } from '../Container.js';

describe('ScopeConfiguration', () => {
  describe('using parent container', () => {
    it(`allows manually inherit composition roots from the parent`, async () => {
      const depA = fn.scoped(() => Math.random());
      const depB = fn.scoped(() => Math.random());

      const compositionRoot = fn.scoped(use => {
        return [use(depA), use(depB)];
      });

      const root = container.new();

      const childContainer = root.checkoutScope((scope, use) => {
        scope.bind(compositionRoot).toRedefined(_ => use(compositionRoot));
      });

      // First, get the value from the child container, to check if the value will "propagate" to parent
      const rootInstance1 = childContainer.use(compositionRoot);
      const rootInstance2 = root.use(compositionRoot);

      expect(rootInstance1).toEqual(rootInstance2);
    });

    describe(`inheritFrom`, () => {
      it(`is not available for the container configuration`, async () => {
        container.new(c => {
          try {
            // @ts-expect-error - inheritFrom is not available for the container configuration
            c.bind(fn.scoped(() => 1)).toInheritedFrom(null);
          } catch (e) {
            // noop
          }
        });
      });

      it(`allows inheriting value from the parent`, async () => {
        const depA = fn.scoped(() => Math.random());
        const depB = fn.scoped(() => Math.random());

        const compositionRoot = fn.scoped(use => {
          return [use(depA), use(depB)];
        });

        const root = container.new();

        const childContainer = root.checkoutScope((scope, parent) => {
          scope.bind(compositionRoot).toInherited();
        });

        // First, get the value from the child container, to check if the value will "propagate" to parent
        const rootInstance1 = childContainer.use(compositionRoot);
        const rootInstance2 = root.use(compositionRoot);

        expect(rootInstance1).toEqual(rootInstance2);
      });
    });
  });
});
