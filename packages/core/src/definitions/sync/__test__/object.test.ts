import { scoped, singleton } from '../../definitions.js';
import { object } from '../object.js';
import { expectType, TypeEqual } from 'ts-expect';
import { InstanceDefinition } from '../../abstract/sync/InstanceDefinition.js';
import { container } from '../../../container/Container.js';
import { set } from '../../../patching/set.js';
import { value } from '../value.js';
import { LifeTime } from '../../abstract/LifeTime.js';
import { describe, it, expect, vi } from 'vitest';

describe(`object`, () => {
  it(`returns definition with correct type`, async () => {
    const someNumberD = value(1);
    const someStr = value('str');
    const composed = object({ num: someNumberD, str: someStr });

    expectType<TypeEqual<typeof composed, InstanceDefinition<{ num: number; str: string }, LifeTime.singleton>>>(true);
  });

  it(`produces instance with correct type`, async () => {
    const someNumberD = value(1);
    const someStr = value('str');
    const composed = object({ num: someNumberD, str: someStr });
    const result = container().get(composed);
    expectType<TypeEqual<typeof result, { num: number; str: string }>>(true);
  });

  it(`can be replaced`, async () => {
    const someNumberD = value(1);
    const someStr = value('str');
    const composed = object({ num: someNumberD, str: someStr });
    const patch = set(composed, { num: 123, str: 'replaced' });

    const result = container([patch]).get(composed);
    expect(result).toEqual({ num: 123, str: 'replaced' });
  });

  describe(`strategy`, () => {
    describe(`all instances have the same strategy`, () => {
      it(`uses strategy from record instance definitions`, async () => {
        const someNumberD = singleton.fn(() => 1);
        const someStr = singleton.fn(() => 'str');
        const composed = object({ num: someNumberD, str: someStr });
        expect(composed.strategy).toEqual(LifeTime.singleton);
      });

      it(`uses strategy from record instance definitions, ex.2`, async () => {
        const someNumberD = scoped.fn(() => 1);
        const someStr = scoped.fn(() => 'str');
        const composed = object({ num: someNumberD, str: someStr });
        expect(composed.strategy).toEqual(LifeTime.scoped);
      });
    });

    describe(`instances use different strategies`, () => {
      it(`uses singleton strategy if any dependency definition is a singleton`, async () => {
        const someNumberD = singleton.fn(() => 1);
        const someStr = scoped.fn(() => 'str');
        const composed = object({ num: someNumberD, str: someStr });
        expect(composed.strategy).toEqual(LifeTime.singleton);
      });
    });

    describe(`empty record`, () => {
      it(`uses transient strategy`, async () => {
        const composed = object({});
        expect(composed.strategy).toEqual(LifeTime.transient);
      });
    });
  });
});
