import { value } from '../value.js';
import { klass } from '../klass.js';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { request, singleton } from '../../definitions.js';
import { describe, it, expect } from 'vitest';
import { implicit } from '../implicit.js';

describe(`klass`, () => {
  describe(`external params`, () => {
    class TestClass {
      constructor(private num: number, private ext: string) {}
    }

    describe(`types`, () => {
      it(`correctly picks external params from instances definitions provided as dependencies ex.1`, async () => {
        const numD = value(123);
        const objD = value('123');
        const cls = klass(LifeTime.request)(TestClass, numD, objD);

        expectType<TypeEqual<typeof cls, InstanceDefinition<TestClass, LifeTime.request>>>(true);
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
                // @ts-expect-error singleton does not accept implicit definitions
                const dep = klass(LifeTime.singleton)(NumberConsumer, implDef);
              } catch (e) {}
            });
          });

          describe(`runtime`, () => {
            it(`does not accept implicit definitions`, async () => {
              const buildDef = () => {
                // @ts-expect-error singleton does not accept implicit definitions
                klass(LifeTime.singleton)(NumberConsumer, implDef);
              };

              expect(buildDef).toThrow('Cannot use scoped dependency for singleton definition.');
            });
          });
        });
      });
    });
  });
});
