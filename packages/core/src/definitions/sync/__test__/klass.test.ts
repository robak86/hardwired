import { external } from '../external.js';
import { value } from '../value.js';
import { klass } from '../klass.js';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/sync/InstanceDefinition.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { request, singleton, transient } from '../../definitions.js';

describe(`klass`, () => {
  describe(`external params`, () => {
    class TestClass {
      constructor(private num: number, private ext: string) {}
    }

    describe(`types`, () => {
      it(`correctly picks external params from instances definitions provided as dependencies ex.1`, async () => {
        const ext = external('objectId').type<string>();
        const numD = value(123);
        const cls = klass(LifeTime.request)(TestClass, numD, ext);

        expectType<TypeEqual<typeof cls, InstanceDefinition<TestClass, LifeTime.request, { objectId: string }>>>(true);
      });

      it(`correctly picks external params from instances definitions provided as dependencies ex.1`, async () => {
        const numD = value(123);
        const objD = value('123');
        const cls = klass(LifeTime.request)(TestClass, numD, objD);

        expectType<TypeEqual<typeof cls, InstanceDefinition<TestClass, LifeTime.request, never>>>(true);
      });

      describe(`allowed dependencies life times`, () => {
        class NumberConsumer {
          constructor(private value: number) {}
        }

        const ext = external('number').type<number>();

        describe(`transient`, () => {
          it(`does not accept singletons with externals`, async () => {
            const buildDef = () => {
              const dep = singleton.fn(val => val, ext);

              // @ts-expect-error transient does not accept singleton dependencies with externals
              klass(LifeTime.transient)(NumberConsumer, dep);
            };

            expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
          });

          it(`accepts request def with externals`, async () => {
            const dep = request.fn(val => val, ext);
            klass(LifeTime.transient)(NumberConsumer, dep);
          });

          it(`accepts transient with externals`, async () => {
            const dep = transient.fn(val => val, ext);
            klass(LifeTime.transient)(NumberConsumer, dep);
          });
        });

        describe(`request`, () => {
          it(`does not accept singletons with externals`, async () => {
            const buildDef = () => {
              const dep = singleton.fn(val => val, ext);

              // @ts-expect-error transient does not accept singleton dependencies with externals
              klass(LifeTime.request)(NumberConsumer, dep);
            };

            expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
          });

          it(`accepts request def with externals`, async () => {
            const dep = request.fn(val => val, ext);
            klass(LifeTime.request)(NumberConsumer, dep);
          });

          it(`accepts transient with externals`, async () => {
            const dep = transient.fn(val => val, ext);
            klass(LifeTime.request)(NumberConsumer, dep);
          });
        });

        describe(`singleton`, () => {
          it(`does not accept singletons with externals`, async () => {
            const buildDef = () => {
              const dep = singleton.fn(val => val, ext);

              // @ts-expect-error transient does not accept singleton dependencies with externals
              klass(LifeTime.singleton)(NumberConsumer, dep);
            };

            expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
          });

          it(`accepts request def with externals`, async () => {
            const buildDef = () => {
              const dep = request.fn(val => val, ext);
              klass(LifeTime.singleton)(NumberConsumer, dep);
            };

            expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
          });

          it(`accepts transient with externals`, async () => {
            const buildDef = () => {
              const dep = transient.fn(val => val, ext);
              klass(LifeTime.singleton)(NumberConsumer, dep);
            };

            expect(buildDef).toThrow('Strategy=singleton does not support external parameters.');
          });
        });
      });
    });

    describe(`runtime`, () => {
      it(`correctly picks external`, async () => {
        const ext = external('objectId').type<string>();
        const numD = value(123);
        const cls = klass(LifeTime.request)(TestClass, numD, ext);
        expect(cls.externals).toEqual(ext.externals);
      });

      it(`correctly picks unique externals`, async () => {
        class TestCls {
          constructor(private ext1: string, private ext2: number) {}
        }

        const ext1 = external('objectId1').type<string>();
        const ext2 = external('objectId2').type<number>();
        const cls = klass(LifeTime.request)(TestCls, ext1, ext2);
        expect(cls.externals).toEqual({
          objectId1: ext1.externals['objectId1'],
          objectId2: ext2.externals['objectId2'],
        });
      });

      it(`correctly picks unique externals2`, async () => {
        class TestCls1 {
          constructor(private ext1: string) {}
        }

        class TestCls2 {
          constructor(private ext2: number) {}
        }

        class TestCls3 {
          constructor(private ext1: string, private ext2: number, cls1: TestCls1, cls2: TestCls2) {}
        }

        const ext1 = external('objectId1').type<string>();
        const ext2 = external('objectId2').type<number>();
        const cls1 = klass(LifeTime.transient)(TestCls1, ext1);
        const cls2 = klass(LifeTime.transient)(TestCls2, ext2);
        const cls3 = klass(LifeTime.transient)(TestCls3, ext1, ext2, cls1, cls2);

        expect(cls3.externals).toEqual({ objectId1: ext1.externals.objectId1, objectId2: ext2.externals.objectId2 });
      });
    });
  });
});
