import { scoped, singleton } from '../../definitions.js';
import { LifeTime } from '../../abstract/LifeTime.js';

import { describe, expect, it } from 'vitest';
import { implicit } from '../implicit.js';
import { expectType, TypeEqual } from 'ts-expect';

describe(`fn`, () => {
  describe(`allowed dependencies life times`, () => {
    const numberConsumer = (val: number) => val;

    const implDef = implicit<number>('number');

    it(`is type-safe`, async () => {
      const dep = scoped.using(implDef).fn(val => {
        expectType<TypeEqual<typeof val, number>>(true);
      });
    });

    describe(`singleton`, () => {
      describe(`compile-time`, () => {
        it(`does not accept implicit definitions`, async () => {
          try {
            // @ts-expect-error request does not accept implicit definitions
            const dep = singleton.using(implDef).fn(numberConsumer);
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
