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

        expectType<TypeEqual<typeof cls, InstanceDefinition<TestClass, { objectId: string }>>>(true);
      });

      it(`correctly picks external params from instances definitions provided as dependencies`, async () => {
        // const ext = external<{ objectId: string }>();
        const numD = value(123);
        const objD = value({ objectId: '123' });
        const cls = klass(SingletonStrategy.type)(TestClass, numD, objD);

        expectType<TypeEqual<typeof cls, InstanceDefinition<TestClass, void>>>(true);
      });
    });
  });
});

