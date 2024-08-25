import { fn } from '../../definitions.js';

import { describe, expect, it } from 'vitest';
import { implicit } from '../implicit.js';

describe(`fn`, () => {
  describe(`allowed dependencies life times`, () => {
    const numberConsumer = (val: number) => val;

    const implDef = implicit<number>('number');

    describe(`singleton`, () => {
      describe(`compile-time`, () => {
        it(`does not accept implicit definitions`, async () => {
          try {
            fn.singleton(use => {
              // @ts-expect-error request does not accept implicit definitions
              use(implDef);
            });
          } catch (err) {
            //noop
          }
        });
      });

      describe(`runtime`, () => {
        it(`does not accept implicit definitions`, async () => {
          const buildDef = () => {
            // @ts-expect-error singleton does not accept implicit definitions
            singleton.using(implDef).fn(numberConsumer);
          };

          expect(buildDef).toThrow('Cannot use scoped dependency for singleton definition.');
        });
      });
    });
  });
});
