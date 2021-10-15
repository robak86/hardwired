import { request, scoped, singleton } from '../../definitions';
import { intersection } from '../intersection';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/InstanceDefinition';
import { object } from '../object';
import { container } from '../../../container/Container';
import { set } from '../../../patching/set';
import { SingletonStrategy } from '../../../strategies/sync/SingletonStrategy';
import { ScopeStrategy } from '../../../strategies/sync/ScopeStrategy';
import { RequestStrategy } from '../../../strategies/sync/RequestStrategy';
import { TransientStrategy } from '../../../strategies/sync/TransientStrategy';

describe(`intersection`, () => {
  describe(`types`, () => {
    it(`produces correct type`, async () => {
      const obj1 = singleton.fn(() => ({ a: 1 }));
      const obj2 = singleton.fn(() => ({ b: 1 }));
      const combined = intersection(obj1, obj2);

      expectType<TypeEqual<typeof combined, InstanceDefinition<{ a: number } & { b: number }, []>>>(true);
    });
  });

  it(`produces correct value`, async () => {
    const obj1 = singleton.fn(() => ({ a: 1 }));
    const obj2 = singleton.fn(() => ({ b: 2 }));
    const combined = intersection(obj1, obj2);
    const result = container().get(combined);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it(`can be replaced`, async () => {
    const obj1 = singleton.fn(() => ({ a: 1 }));
    const obj2 = singleton.fn(() => ({ b: 2 }));
    const combined = intersection(obj1, obj2);

    const patch = set(combined, { a: 123, b: 456 });

    const result = container([patch]).get(combined);
    expect(result).toEqual({ a: 123, b: 456 });
  });

  describe(`strategy`, () => {
    describe(`all instances have the same strategy`, () => {
      it(`uses strategy from record instance definitions`, async () => {
        const someNumberD = singleton.fn(() => 1);
        const someStr = singleton.fn(() => 'str');
        const combined = object({ num: someNumberD, str: someStr });
        expect(combined.strategy).toEqual(SingletonStrategy.type);
      });

      it(`uses strategy from record instance definitions, ex.2`, async () => {
        const someNumberD = scoped.fn(() => 1);
        const someStr = scoped.fn(() => 'str');
        const combined = object({ num: someNumberD, str: someStr });
        expect(combined.strategy).toEqual(ScopeStrategy.type);
      });

      it(`uses strategy from record instance definitions, ex.3`, async () => {
        const someNumberD = request.fn(() => 1);
        const someStr = request.fn(() => 'str');
        const combined = object({ num: someNumberD, str: someStr });
        expect(combined.strategy).toEqual(RequestStrategy.type);
      });
    });

    describe(`instances use different strategies`, () => {
      it(`uses transient strategy`, async () => {
        const someNumberD = singleton.fn(() => 1);
        const someStr = scoped.fn(() => 'str');
        const combined = object({ num: someNumberD, str: someStr });
        expect(combined.strategy).toEqual(TransientStrategy.type);
      });
    });

    describe(`empty record`, () => {
      it(`uses transient strategy`, async () => {
        const combined = object({});
        expect(combined.strategy).toEqual(TransientStrategy.type);
      });
    });
  });
});
