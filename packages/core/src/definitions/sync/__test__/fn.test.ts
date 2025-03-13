import { describe, expect, it } from 'vitest';

import { fn } from '../../definitions.js';
import { unbound } from '../unbound.js';

describe(`fn`, () => {
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
