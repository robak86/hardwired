import { implicit } from '../../sync/implicit.js';
import { singleton } from '../../definitions.js';
import { describe, expect, it } from 'vitest';

describe(`asyncClass`, () => {
  describe(`types`, () => {
    describe(`allowed dependencies life times`, () => {
      class NumberConsumer {
        constructor(private value: number) {}
      }

      const implDef = implicit<number>('number');

      describe(`singleton`, () => {
        describe(`compile-time`, () => {
          it(`does not accept implicit definitions`, async () => {
            try {
              // @ts-expect-error singleton does not accept implicit definitions
              const dep = singleton.async().using(implDef).class(NumberConsumer);
            } catch (e) {
              // nothing to do here
            }
          });
        });

        describe(`runtime`, () => {
          it(`does not accept implicit definitions`, async () => {
            const buildDef = () => {
              // @ts-expect-error singleton does not accept implicit definitions
              singleton.async().using(implDef).class(NumberConsumer);
            };

            expect(buildDef).toThrow('Cannot use scoped dependency for singleton definition.');
          });
        });
      });
    });
  });
});
