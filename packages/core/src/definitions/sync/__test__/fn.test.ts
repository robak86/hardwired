import { singleton } from '../../definitions.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { fn } from '../fn.js';
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
            // @ts-expect-error request does not accept implicit definitions
            const dep = fn(LifeTime.singleton)(numberConsumer, implDef);
          } catch (err) {
            //noop
          }
        });
      });

      describe(`runtime`, () => {
        it(`does not accept implicit definitions`, async () => {
          const buildDef = () => {
            // @ts-expect-error singleton does not accept implicit definitions
            fn(LifeTime.singleton)(numberConsumer, implDef);
          };

          expect(buildDef).toThrow('Cannot use scoped dependency for singleton definition.');
        });
      });
    });
  });
});
