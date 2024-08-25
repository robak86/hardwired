import { implicit } from '../../sync/implicit.js';
import { fn, singleton } from '../../definitions.js';
import { describe, expect, it } from 'vitest';

describe(`asyncFn`, () => {
  describe(`types`, () => {
    describe(`allowed dependencies life times`, () => {
      const numberConsumer = async (val: number) => val;

      const implDef = implicit<number>('ext1');

      describe(`singleton`, () => {
        describe(`compile-time`, () => {
          it(`does not accept implicit definitions`, async () => {
            const someScoped = fn.scoped(() => 123);
            // const someScoped = implicit<number>('someValue')

            try {
              fn.singleton(use => {
                // @ts-expect-error request does not accept implicit definitions
                use(someScoped);
              });
            } catch (err) {
              // noop
            }
          });
        });

        describe(`runtime`, () => {
          it.skip(`does not accept implicit definitions`, async () => {
            const buildDef = () => {
              fn.singleton(use => {
                // @ts-expect-error singleton does not accept implicit definitions
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
