import { fn } from '../../definitions.js';

import { describe, expect, it } from 'vitest';
import { implicit } from '../implicit.js';

describe(`fn`, () => {
  describe(`allowed dependencies life times`, () => {
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
