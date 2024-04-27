import { buildDefine } from '../buildDefine.js';
import { LifeTime } from '../../definitions/abstract/LifeTime.js';
import { expectType, TypeOf } from 'ts-expect';
import { InstanceDefinition } from '../../definitions/abstract/sync/InstanceDefinition.js';
import { describe } from 'vitest';
import { container } from '../../container/Container.js';

describe(`buildDefine`, () => {
  describe(`types`, () => {
    it(`sets correct lifetime for a generic type`, async () => {
      const singleton = buildDefine({ lifeTime: LifeTime.singleton });
      const someDef = singleton(() => 123);
      expectType<TypeOf<typeof someDef, InstanceDefinition<number, LifeTime.singleton, unknown>>>(true);
    });

    it(`sets correct lifetime for a generic type`, async () => {
      const singleton = buildDefine({ lifeTime: LifeTime.transient });
      const someDef = singleton(() => 123);
      expectType<TypeOf<typeof someDef, InstanceDefinition<number, LifeTime.transient, unknown>>>(true);
    });
  });

  describe('instantiation', () => {
    it(`creates correct instance`, async () => {
      const singleton = buildDefine({ lifeTime: LifeTime.singleton });
      const someDependency = singleton(() => 999);
      const someDef = singleton(({ use }) => use(someDependency) + 1);
      expect(container().use(someDef)).toBe(1000);
    });
  });

  describe(`lifetime`, () => {});

  describe(`meta`, () => {});

  describe(`after callback`, () => {});
});
