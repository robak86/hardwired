import { describe, expect } from 'vitest';

import { container } from '../Container.js';
import { cascading, scoped, singleton } from '../../definitions/def-symbol.js';

describe(`Scopes`, () => {
  describe(`root scope`, () => {
    describe('frozen definitions', () => {
      it(`freezes values for the root scope`, async () => {
        const def = singleton<number>();

        const cnt = container.new(scope => {
          return scope.freeze(def).static(100);
        });

        expect(cnt.use(def)).toEqual(100);
      });

      it(`propagates frozen definitions to child scopes`, async () => {
        const def = singleton<number>();

        const cnt = container.new(scope => {
          return scope.freeze(def).static(1);
        });

        const l1 = cnt.scope();
        const l2 = l1.scope();

        expect(l1.use(def)).toEqual(1);
        expect(l2.use(def)).toEqual(1);
      });

      describe(`overriding child bindings`, () => {
        describe(`local bindings`, () => {
          it(`overrides static value binding`, async () => {
            const def = scoped<number>();

            const cnt = container.new(scope => {
              return scope.freeze(def).static(1);
            });
            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.override(def).static(2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });
        });

        describe(`cascading bindings`, () => {
          it(`overrides static value binding`, async () => {
            const def = cascading<number>();

            const cnt = container.new(scope => scope.freeze(def).static(1));

            const l1 = cnt.scope();
            const l2 = l1.scope(scope => scope.modify(def).static(2));

            expect(l1.use(def)).toEqual(1);
            expect(l2.use(def)).toEqual(1);
          });
        });
      });
    });

    describe('setting cascading bindings', () => {
      it(`uses dependencies from the same scope`, async () => {
        const def = cascading<number>();
        const consumer = cascading<number>();

        const root = container.new(scope => {
          scope.add(def).static(1);
          scope.add(consumer).fn(val => val, def);
        });

        const l1 = root.scope(scope => {
          scope.modify(def).static(10);
          scope.modify(consumer).cascade();
        });

        const l2 = l1.scope(scope => {
          scope.modify(def).static(100);
          scope.modify(consumer).cascade();
        });
        const l3 = l2.scope();

        expect(l3.use(consumer)).toEqual(100);
        expect(l2.use(consumer)).toEqual(100);
        expect(l2.use(def)).toEqual(100);
      });
    });
  });
});
