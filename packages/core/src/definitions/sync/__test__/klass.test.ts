import { external } from '../external';
import { value } from '../value';
import { klass } from '../klass';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/InstanceDefinition';
import { LifeTime } from '../../abstract/LifeTime';
import { request, singleton, transient } from '../../definitions';

describe(`klass`, () => {
  describe(`external params`, () => {
    class TestClass {
      constructor(private num: number, private ext: { objectId: string }) {}
    }

    describe(`types`, () => {
      it(`correctly picks external params from instances definitions provided as dependencies`, async () => {
        const ext = external<{ objectId: string }>();
        const numD = value(123);
        const cls = klass(LifeTime.singleton)(TestClass, numD, ext);

        expectType<TypeEqual<typeof cls, InstanceDefinition<TestClass, LifeTime.singleton, [{ objectId: string }]>>>(
          true,
        );
      });

      it(`correctly picks external params from instances definitions provided as dependencies`, async () => {
        // const ext = external<{ objectId: string }>();
        const numD = value(123);
        const objD = value({ objectId: '123' });
        const cls = klass(LifeTime.singleton)(TestClass, numD, objD);

        expectType<TypeEqual<typeof cls, InstanceDefinition<TestClass, LifeTime.singleton, []>>>(true);
      });

      describe(`allowed dependencies life times`, () => {
        class NumberConsumer {
          constructor(private value: number) {}
        }

        const ext = external<number>();

        describe(`transient`, () => {
          it(`does not accept singletons with externals`, async () => {
            const dep = singleton.fn(val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            klass(LifeTime.transient)(NumberConsumer, dep);
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
            const dep = singleton.fn(val => val, ext);

            // @ts-expect-error transient does not accept singleton dependencies with externals
            klass(LifeTime.request)(NumberConsumer, dep);
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
            const dep = singleton.fn(val => val, ext);
            klass(LifeTime.singleton)(NumberConsumer, dep);
          });

          it(`accepts request def with externals`, async () => {
            const dep = request.fn(val => val, ext);
            klass(LifeTime.singleton)(NumberConsumer, dep);
          });

          it(`accepts transient with externals`, async () => {
            const dep = transient.fn(val => val, ext);
            klass(LifeTime.singleton)(NumberConsumer, dep);
          });
        });
      });
    });

    describe(`runtime`, () => {
      it(`correctly picks external`, async () => {
        const ext = external<{ objectId: string }>();
        const numD = value(123);
        const cls = klass(LifeTime.singleton)(TestClass, numD, ext);
        expect(cls.externals).toEqual(ext.externals);
      });

      it(`correctly picks unique externals`, async () => {
        class TestCls {
          constructor(private ext: { objectId1: string }, private ext2: { objectId2: string }) {}
        }

        const ext1 = external<{ objectId1: string }>();
        const ext2 = external<{ objectId2: string }>();
        const cls = klass(LifeTime.singleton)(TestCls, ext1, ext2);
        expect(cls.externals).toEqual([...ext1.externals, ...ext2.externals]);
      });

      it(`correctly picks unique externals2`, async () => {
        class TestCls1 {
          constructor(private ext: { objectId1: string }) {}
        }

        class TestCls2 {
          constructor(private ext2: { objectId2: string }) {}
        }

        class TestCls3 {
          constructor(
            private ext: { objectId1: string },
            private ext2: { objectId2: string },
            cls1: TestCls1,
            cls2: TestCls2,
          ) {}
        }

        const ext1 = external<{ objectId1: string }>();
        const ext2 = external<{ objectId2: string }>();
        const cls1 = klass(LifeTime.transient)(TestCls1, ext1);
        const cls2 = klass(LifeTime.transient)(TestCls2, ext2);
        const cls3 = klass(LifeTime.transient)(TestCls3, ext1, ext2, cls1, cls2);

        expect(cls3.externals).toEqual([...ext1.externals, ...ext2.externals]);
      });
    });
  });
});
