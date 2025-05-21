import { BindingsRegistry } from '../BindingsRegistry.js';
import { cascading } from '../../definitions/def-symbol.js';
import { Definition } from '../../definitions/impl/Definition.js';

describe(`BindingsRegistry`, () => {
  function setup() {
    const registry = BindingsRegistry.create();
    const container = {} as any;

    const symbol = cascading<number>();

    const definition = new Definition(symbol.id, symbol.strategy, () => 1);
    const otherDefinition = new Definition(symbol.id, symbol.strategy, () => 1);

    return {
      registry,
      symbol,
      definition,
      container,
      otherDefinition,
    };
  }

  describe(`hasCascading root`, () => {
    it(`returns true when setCascadeRoot was called on the current registry`, async () => {
      const { registry, symbol, container } = setup();

      expect(registry.hasCascadingRoot(symbol.id)).toEqual(false);

      registry.setCascadeRoot(symbol, container);

      expect(registry.hasCascadingRoot(symbol.id)).toEqual(true);

      const childRegistry = registry.checkoutForScope();

      expect(childRegistry.hasCascadingRoot(symbol.id)).toEqual(false);
      childRegistry.setCascadeRoot(symbol, container);

      expect(childRegistry.hasCascadingRoot(symbol.id)).toEqual(true);
    });
  });

  describe(`register`, () => {
    describe(`cascading`, () => {
      describe(`register`, () => {
        it(`registers a definition`, async () => {
          const { registry, symbol, container, definition } = setup();

          registry.register(symbol, definition, container);

          expect(registry.getDefinition(symbol)).toBe(definition);
        });

        it(`does not inherit overrides`, async () => {
          const { registry, symbol, container, definition, otherDefinition } = setup();

          registry.register(symbol, definition, container);
          registry.override(otherDefinition);

          expect(registry.getDefinition(symbol)).toBe(otherDefinition);

          const childRegistry = registry.checkoutForScope();

          expect(childRegistry.getDefinition(symbol)).toBe(definition);
        });
      });
    });
  });
});
