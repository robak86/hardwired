import { implicit } from '../../sync/external.js';
import { singleton } from '../../definitions.js';
import { asyncClass } from '../asyncClass.js';
import { LifeTime } from '../../abstract/LifeTime.js';
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
              const dep = asyncClass(LifeTime.singleton)(NumberConsumer, implDef);
            } catch (e) {}
          });
        });

        describe(`runtime`, () => {
          it(`does not accept implicit definitions`, async () => {
            const buildDef = () => {
              // @ts-expect-error singleton does not accept implicit definitions
              asyncClass(LifeTime.singleton)(NumberConsumer, implDef);
            };

            expect(buildDef).toThrow('Cannot use scoped dependency for singleton definition.');
          });
        });
      });
    });
  });
});
