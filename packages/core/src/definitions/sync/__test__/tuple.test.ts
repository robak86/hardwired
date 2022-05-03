import { request, scoped, singleton } from '../../definitions';
import { object } from '../object';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/sync/InstanceDefinition';
import { container } from '../../../container/Container';
import { set } from '../../../patching/set';
import { value } from '../value';
import { tuple } from '../tuple';
import { LifeTime } from '../../abstract/LifeTime';

describe(`object`, () => {
  it(`returns definition with correct type`, async () => {
    const someNumberD = value(1);
    const someStr = value('str');
    const composed = tuple(someNumberD, someStr);
    expectType<TypeEqual<typeof composed, InstanceDefinition<[number, string], LifeTime.singleton, []>>>(true);
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
        expect(composed.strategy).toEqual(LifeTime.singleton);
      });

      it(`uses strategy from record instance definitions, ex.2`, async () => {
        const someNumberD = scoped.fn(() => 1);
        const someStr = scoped.fn(() => 'str');
        const composed = tuple(someNumberD, someStr);
        expect(composed.strategy).toEqual(LifeTime.scoped);
      });

      it(`uses strategy from record instance definitions, ex.3`, async () => {
        const someNumberD = request.fn(() => 1);
        const someStr = request.fn(() => 'str');
        const composed = tuple(someNumberD, someStr);
        expect(composed.strategy).toEqual(LifeTime.request);
      });
    });

    describe(`instances use different strategies`, () => {
      it(`uses singleton if any dependency is singleton`, async () => {
        const someNumberD = singleton.fn(() => 1);
        const someStr = scoped.fn(() => 'str');
        const composed = tuple(someNumberD, someStr);
        expect(composed.strategy).toEqual(LifeTime.singleton);
      });
    });

    describe(`empty record`, () => {
      it(`uses transient strategy`, async () => {
        const composed = tuple();
        expect(composed.strategy).toEqual(LifeTime.transient);
      });
    });
  });
});
