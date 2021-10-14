import { external } from '../external';
import { value } from '../value';
import { SingletonStrategy } from '../../../strategies/sync/SingletonStrategy';
import { klass } from '../klass';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/InstanceDefinition';

describe(`klass`, () => {
  describe(`external params`, () => {
    class TestClass {
      constructor(private num: number, private ext: { objectId: string }) {}
    }

    describe(`types`, () => {
      it(`correctly picks external params from instances definitions provided as dependencies`, async () => {
        const ext = external<{ objectId: string }>();
        const numD = value(123);
        const cls = klass(SingletonStrategy.type)(TestClass, numD, ext);

        expectType<TypeEqual<typeof cls, InstanceDefinition<TestClass, [{ objectId: string }]>>>(true);
      });

      it(`correctly picks external params from instances definitions provided as dependencies`, async () => {
        // const ext = external<{ objectId: string }>();
        const numD = value(123);
        const objD = value({ objectId: '123' });
        const cls = klass(SingletonStrategy.type)(TestClass, numD, objD);

        expectType<TypeEqual<typeof cls, InstanceDefinition<TestClass, []>>>(true);
      });
    });

    describe(`runtime`, () => {
      it(`correctly picks external`, async () => {
        const ext = external<{ objectId: string }>();
        const numD = value(123);
        const cls = klass(SingletonStrategy.type)(TestClass, numD, ext);
        expect(cls.externals).toEqual(ext.externals);
      });

      it(`correctly picks unique externals`, async () => {
        class TestCls {
          constructor(private ext: { objectId1: string }, private ext2: { objectId2: string }) {}
        }

        const ext1 = external<{ objectId1: string }>();
        const ext2 = external<{ objectId2: string }>();
        const cls = klass(SingletonStrategy.type)(TestCls, ext1, ext2);
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
        const cls1 = klass(SingletonStrategy.type)(TestCls1, ext1);
        const cls2 = klass(SingletonStrategy.type)(TestCls2, ext2);
        const cls3 = klass(SingletonStrategy.type)(TestCls3, ext1, ext2, cls1, cls2);

        expect(cls3.externals).toEqual([...ext1.externals, ...ext2.externals]);
      });
    });
  });
});
