import { BindingsRegistry } from '../BindingsRegistry.js';
import { cascading } from '../../definitions/tokens.js';
import { Definition } from '../../definitions/impl/Definition.js';
import { MaybeAsync } from '../../utils/MaybeAsync.js';

describe(`BindingsRegistry`, () => {
  function setup() {
    const registry = BindingsRegistry.create();
    const container = {} as any;

    const token = cascading<number>();

    const definition = new Definition(token.id, token.strategy, () => MaybeAsync.resolve(1));
    const otherDefinition = new Definition(token.id, token.strategy, () => MaybeAsync.resolve(1));

    return {
      registry,
      token,
      definition,
      container,
      otherDefinition,
    };
  }

  describe(`hasCascading root`, () => {
    it(`returns true when setCascadeRoot was called on the current registry`, async () => {
      const { registry, token, container } = setup();

      expect(registry.hasOwnCascadingRoot(token.id)).toEqual(false);

      registry.setCascadeRoot(token, container);

      expect(registry.hasOwnCascadingRoot(token.id)).toEqual(true);

      const childRegistry = registry.checkoutForScope();

      expect(childRegistry.hasOwnCascadingRoot(token.id)).toEqual(false);
      childRegistry.setCascadeRoot(token, container);

      expect(childRegistry.hasOwnCascadingRoot(token.id)).toEqual(true);
    });
  });

  describe(`register`, () => {
    describe(`cascading`, () => {
      describe(`register`, () => {
        it(`registers a definition`, async () => {
          const { registry, token, container, definition } = setup();

          registry.register(token, definition, container);

          expect(registry.getDefinition(token)).toBe(definition);
        });

        it(`does not inherit overrides`, async () => {
          const { registry, token, container, definition, otherDefinition } = setup();

          registry.register(token, definition, container);
          registry.override(otherDefinition);

          expect(registry.getDefinition(token)).toBe(otherDefinition);

          const childRegistry = registry.checkoutForScope();

          expect(childRegistry.getDefinition(token)).toBe(definition);
        });
      });
    });
  });
});
