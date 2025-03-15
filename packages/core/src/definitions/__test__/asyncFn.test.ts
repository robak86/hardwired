import { describe, expect, it } from 'vitest';

import { unbound } from '../unbound.js';
import { fn } from '../fn.js';

describe(`asyncFn`, () => {
  describe(`types`, () => {
    describe(`allowed dependencies life times`, () => {
      const implDef = unbound<number>();

      describe(`singleton`, () => {
        describe(`compile-time`, () => {
          it(`does not accept unbound definitions`, async () => {
            const someScoped = fn.scoped(() => 123);
            // const someScoped = unbound<number>('someValue')

            try {
              fn.singleton(use => {
                // @ts-expect-error request does not accept unbound definitions
                use(someScoped);
              });
            } catch (err) {
              // noop
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
});
