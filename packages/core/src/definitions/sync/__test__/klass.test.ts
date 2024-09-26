import { value } from '../value.js';
import { expectType, TypeEqual } from 'ts-expect';

import { LifeTime } from '../../abstract/LifeTime.js';
import { fn } from '../../definitions.js';
import { describe, expect, it } from 'vitest';
import { implicit } from '../implicit.js';

import { BaseDefinition } from '../../abstract/BaseDefinition.js';

describe(`klass`, () => {
  describe(`external params`, () => {
    class TestClass {
      constructor(
        // @ts-ignore
        private num: number,
        // @ts-ignore
        private ext: string,
      ) {}
    }

    describe(`types`, () => {
      it(`correctly picks external params from instances definitions provided as dependencies ex.1`, async () => {
        const numD = value(123);
        const objD = value('123');

        const cls = fn.scoped(use => {
          return new TestClass(use(numD), use(objD));
        });

        expectType<TypeEqual<typeof cls, BaseDefinition<TestClass, LifeTime.scoped, unknown, []>>>(true);
      });

      describe(`allowed dependencies life times`, () => {
        class NumberConsumer {
          // @ts-ignore
          constructor(private value: number) {}
        }

        const implDef = implicit<number>('number');

        describe(`singleton`, () => {
          describe(`compile-time`, () => {
            it(`does not accept implicit definitions`, async () => {
              try {
                // @ts-expect-error singleton does not accept implicit definitions
                const dep = singleton.using(implDef).class(NumberConsumer);
              } catch (e) {
                // noop
              }
            });
          });

          describe(`runtime`, () => {
            it.skip(`does not accept implicit definitions`, async () => {
              const buildDef = () => {
                // @ts-expect-error singleton does not accept implicit definitions
                singleton.using(implDef).class(NumberConsumer);
              };

              expect(buildDef).toThrow('Cannot use scoped dependency for singleton definition.');
            });
          });
        });
      });
    });
  });
});
