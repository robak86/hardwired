import { request, scoped, singleton } from '../../definitions';
import { object } from '../object';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/InstanceDefinition';
import { container } from '../../../container/Container';
import { SingletonStrategy } from '../../../strategies/sync/SingletonStrategy';
import { TransientStrategy } from '../../../strategies/sync/TransientStrategy';
import { ScopeStrategy } from '../../../strategies/sync/ScopeStrategy';
import { RequestStrategy } from '../../../strategies/sync/RequestStrategy';
import { set } from '../../../patching/set';
import { value } from '../value';
import { tuple } from '../tuple';

describe(`object`, () => {
  it(`returns definition with correct type`, async () => {
    const someNumberD = value(1);
    const someStr = value('str');
    const composed = tuple(someNumberD, someStr);
    expectType<TypeEqual<typeof composed, InstanceDefinition<[number, string]>>>(true);
  });

  it(`produces instance with correct type`, async () => {
    const someNumberD = value(1);
    const someStr = value('str');
    const composed = tuple(someNumberD, someStr);
    const result = container().get(composed);
    expect(result).toEqual([1, 'str']);
  });

  it(`can be replaced`, async () => {
    const someNumberD = value(1);
    const someStr = value('str');
    const composed = tuple(someNumberD, someStr);
    const patch = set(composed, [123, 'replaced']);

    const result = container([patch]).get(composed);
    expect(result).toEqual([123, 'replaced']);
  });

  describe(`strategy`, () => {
    describe(`all instances have the same strategy`, () => {
      it(`uses strategy from record instance definitions`, async () => {
        const someNumberD = singleton.fn(() => 1);
        const someStr = singleton.fn(() => 'str');
        const composed = tuple(someNumberD, someStr);
        expect(composed.strategy).toEqual(SingletonStrategy.type);
      });

      it(`uses strategy from record instance definitions, ex.2`, async () => {
        const someNumberD = scoped.fn(() => 1);
        const someStr = scoped.fn(() => 'str');
        const composed = tuple(someNumberD, someStr);
        expect(composed.strategy).toEqual(ScopeStrategy.type);
      });

      it(`uses strategy from record instance definitions, ex.3`, async () => {
        const someNumberD = request.fn(() => 1);
        const someStr = request.fn(() => 'str');
        const composed = tuple(someNumberD, someStr);
        expect(composed.strategy).toEqual(RequestStrategy.type);
      });
    });

    describe(`instances use different strategies`, () => {
      it(`uses transient strategy`, async () => {
        const someNumberD = singleton.fn(() => 1);
        const someStr = scoped.fn(() => 'str');
        const composed = tuple(someNumberD, someStr);
        expect(composed.strategy).toEqual(TransientStrategy.type);
      });
    });

    describe(`empty record`, () => {
      it(`uses transient strategy`, async () => {
        const composed = tuple();
        expect(composed.strategy).toEqual(TransientStrategy.type);
      });
    });
  });
});
