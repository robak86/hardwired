import { BindingsRegistry } from '../BindingsRegistry.js';
import { fn } from '../../definitions/definitions.js';
import { Definition } from '../../definitions/abstract/Definition.js';

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

      const registry = BindingsRegistry.create();
      expect(registry.getDefinition(def)).toBe(def);

      registry.addScopeBinding(defV2);
      expect(registry.getDefinition(def)).toBe(defV2);

      const child = registry.checkoutForScope();
      expect(child.getDefinition(def)).toBe(def);

      expect(() => registry.addCascadingBinding(defV3)).toThrow(); // Cannot override scope binding with cascading
      expect(registry.getDefinition(def)).toBe(defV2);
    });
  });
});
