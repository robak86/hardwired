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
    it(`doesn't propagate scoped definitions`, async () => {
      const { def, defV2, defV3 } = setup();

      const registry = BindingsRegistry.create();
      expect(registry.getDefinition(def)).toBe(def);

      registry.addScopeBinding(defV2);
      expect(registry.getDefinition(def)).toBe(defV2);

      const child = registry.checkoutForScope();
      expect(child.getDefinition(def)).toBe(def);

      registry.addCascadingBinding(defV3);
      expect(registry.getDefinition(def)).toBe(defV3);
    });
  });

  describe(`cascading definitions`, () => {
    //   it(`propagates cascading definitions`, async () => {
    //     const { parentContainer, def, defRedefined } = setup();
    //
    //     const registry = BindingsRegistry.create();
    //
    //     expect(registry.getDefinition(def)).toBe(defRedefined);
    //
    //     const childRegistry = registry.checkoutForScope();
    //
    //     expect(childRegistry.getDefinition(def)).toBe(defRedefined);
    //   });
    //
    //   it(`propagates cascading definitions 2`, async () => {
    //     const { parentContainer, def, defRedefined, defRedefinedTwice } = setup();
    //
    //     const registry = BindingsRegistry.create({
    //       scopeDefinitions: [],
    //       cascadingDefinitions: [defRedefined],
    //       frozenDefinitions: [],
    //     });
    //
    //     expect(registry.getDefinition(def)).toBe(defRedefined);
    //
    //     const childRegistry = registry.checkoutForScope();
    //
    //     expect(childRegistry.getDefinition(def)).toBe(defRedefined);
    //   });
  });
});
