import { BindingsRegistry } from '../BindingsRegistry.js';
import { fn } from '../../definitions/fn.js';
import { Definition } from '../../definitions/impl/Definition.js';

describe(`BindingsRegistry`, () => {
  function setup() {
    const def = fn.scoped(() => 1);
    const defV2 = new Definition(def.id, def.strategy, () => 123);
    const defV3 = new Definition(def.id, def.strategy, () => 456);

    return { def, defV2, defV3 };
  }

  describe('scope definitions', () => {
    it(`scoped takes precedence over cascading`, async () => {
      const { def, defV2, defV3 } = setup();

      const root = BindingsRegistry.create();

      expect(root.getDefinition(def)).toBe(def);

      root.addScopeBinding(defV2);
      expect(root.getDefinition(def)).toBe(defV2);

      const child = root.checkoutForScope();

      expect(child.getDefinition(def)).toBe(defV2);

      expect(() => root.addCascadingBinding(defV3)).toThrow(); // Cannot override scope binding with cascading
      expect(root.getDefinition(def)).toBe(defV2);
    });
  });
});
