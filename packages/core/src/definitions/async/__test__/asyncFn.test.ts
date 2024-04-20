import { implicit } from '../../sync/implicit.js';
import { singleton } from '../../definitions.js';
import { describe, expect, it } from 'vitest';

describe(`asyncFn`, () => {
  describe(`types`, () => {
    describe(`allowed dependencies life times`, () => {
      const numberConsumer = async (val: number) => val;

      const implDef = implicit<number>('ext1');

      describe(`singleton`, () => {
        describe(`compile-time`, () => {
          it(`does not accept implicit definitions`, async () => {
            try {
              // @ts-expect-error request does not accept implicit definitions
              const dep = singleton.async().using(implDef).fn(numberConsumer);
            } catch (err) {
              // noop
            }
          });
        });

        describe(`runtime`, () => {
          it(`does not accept implicit definitions`, async () => {
            const buildDef = () => {
              // @ts-expect-error singleton does not accept implicit definitions
              singleton.async().using(implDef).fn(numberConsumer);
            };

            expect(buildDef).toThrow('Cannot use scoped dependency for singleton definition.');
          });
        });
      });
    });
  });
});
