import { describe, expect, it } from 'vitest';
import { expectType } from 'ts-expect';

import { fn } from '../fn.js';
import { unbound } from '../unbound.js';
import type { IContainer } from '../../container/IContainer.js';
import type { Definition } from '../impl/Definition.js';
import type { LifeTime } from '../abstract/LifeTime.js';
import { withMiddleware } from '../composition/withMiddleware.js';

describe(`fn`, () => {
  describe(`extend`, () => {
    it(`returns typesafe factory`, async () => {
      const factory = withMiddleware.transient((locator: IContainer, next, ...args) => {
        const scope = locator.scope();

        return next(scope, ...args);
      });

      const numDef = factory(() => 123);
      const strDef = factory(() => 'str');

      expectType<Definition<number, LifeTime.transient, []>>(numDef);
      expectType<Definition<string, LifeTime.transient, []>>(strDef);
    });
  });

  describe(`allowed dependencies life times`, () => {
    const implDef = unbound<number>();

    describe(`singleton`, () => {
      describe(`compile-time`, () => {
        it(`does not accept unbound definitions`, async () => {
          try {
            fn.singleton(use => {
              // @ts-expect-error request does not accept unbound definitions
              use(implDef);
            });
          } catch (err) {
            //noop
          }
        });
      });

      describe(`runtime`, () => {
        it.skip(`does not accept unbound definitions`, async () => {
          const buildDef = () => {
            fn.singleton(use => {
              // @ts-expect-error singleton does not accept unbound definitions
              use(implDef);
            });
          };

          expect(buildDef).toThrow('Cannot use scoped dependency for singleton definition.');
        });
      });
    });
  });
});
