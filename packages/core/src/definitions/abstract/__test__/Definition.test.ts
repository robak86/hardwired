import { Definition } from '../Definition.js';
import { LifeTime } from '../LifeTime.js';
import { container } from '../../../container/Container.js';
import { IContainer, IStrategyAware } from '../../../container/IContainer.js';
import { describe } from 'vitest';

describe(`Definition`, () => {
  describe(`bind`, () => {
    it(`binds to some container ignoring the one passed to create`, async () => {
      const createSpy = vi.fn();
      const def = new Definition(Symbol(), LifeTime.scoped, createSpy);

      const cnt1 = container.new();
      const cnt2 = container.new();

      const bound = def.bind(cnt1 as IContainer & IStrategyAware);

      bound.create(cnt2 as IContainer & IStrategyAware);

      expect(createSpy).toBeCalledWith(cnt1);
    });
  });

  describe(`name`, () => {
    describe('named function', () => {
      it(`returns name of the factory function`, async () => {
        const def = new Definition(Symbol(), LifeTime.scoped, function MyFactory() {});

        expect(def.name).toBe('MyFactory');
      });
    });
  });
});
