import { BindingsRegistry } from '../BindingsRegistry.js';
import { cascading } from '../../definitions/def-symbol.js';
import { BoxedValue } from '../../__test__/BoxedValue.js';
import { container } from '../../container/Container.js';
import { Definition } from '../../definitions/impl/Definition.js';

describe(`BindingsRegistry`, () => {
  describe(`ownCascading`, () => {
    it(`binds definition to a container`, async () => {
      const def = cascading<BoxedValue<string>>('num');

      const impl = new Definition(def.id, def.strategy, () => new BoxedValue('root'));

      const unused = container.new();
      const cnt1 = container.new();
      const cnt2 = container.new();

      vi.spyOn(unused, 'buildWithStrategy');
      vi.spyOn(cnt1, 'buildWithStrategy');
      vi.spyOn(cnt2, 'buildWithStrategy');

      const root = BindingsRegistry.create();

      root.register(def, impl, cnt1);

      await root.getDefinition(def).create(unused);

      expect(unused.buildWithStrategy).not.toBeCalled();
      expect(cnt1.buildWithStrategy).toHaveBeenCalledTimes(1);
      expect(cnt2.buildWithStrategy).toHaveBeenCalledTimes(0);

      const child = root.checkoutForScope();

      child.ownCascading(def, cnt2);
      await child.getDefinition(def).create(unused);

      expect(unused.buildWithStrategy).not.toBeCalled();
      expect(cnt1.buildWithStrategy).toHaveBeenCalledTimes(1);
      expect(cnt2.buildWithStrategy).toHaveBeenCalledTimes(1);
    });
  });
});
