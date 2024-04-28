import { value } from '../value.js';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { scoped, singleton } from '../../definitions.js';
import { describe, expect, it } from 'vitest';
import { implicit } from '../implicit.js';

describe(`klass`, () => {
  describe(`external params`, () => {
    class TestClass {
      constructor(
        private num: number,
        private ext: string,
      ) {}
    }

    describe(`types`, () => {
      it(`correctly picks external params from instances definitions provided as dependencies ex.1`, async () => {
        const numD = value(123);
        const objD = value('123');
        const cls = scoped(c => new TestClass(c.use(numD), c.use(objD)));

        expectType<TypeEqual<typeof cls, InstanceDefinition<TestClass, LifeTime.scoped, unknown>>>(true);
      });

      describe(`allowed dependencies life times`, () => {
        class NumberConsumer {
          constructor(private value: number) {}
        }

        const implDef = implicit<number>('number');

        describe(`singleton`, () => {
          describe(`compile-time`, () => {
            it(`does not accept implicit definitions`, async () => {
              try {
                const dep = singleton(c => {
                  return new NumberConsumer(c.use(implDef));
                });
              } catch (e) {
                // noop
              }
            });
          });

          describe(`runtime`, () => {
            it(`does not accept implicit definitions`, async () => {
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
