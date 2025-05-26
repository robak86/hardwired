import { cascading, singleton } from '../../definitions/tokens.js';
import { configureContainer } from '../../configuration/ContainerConfiguration.js';
import { BindingsRegistry } from '../BindingsRegistry.js';

describe(`BindingsRegistry`, () => {
  const def1 = singleton<number>('def');
  const def2 = cascading<number>('def');
  const def3 = cascading<number>('def2');
  const def4 = cascading<number>('def3');

  describe(`definitions`, () => {
    it(`correctly applies configurations`, async () => {
      const config1 = configureContainer(c => {
        c.add(def1).static(1);
      });

      const config2 = configureContainer(c => {
        c.add(def2).static(2);
      });

      const registry = BindingsRegistry.create([config1, config2]);

      // expect(registry.getDefinition(def1).id).toEqual(def1.id);

      // expect(registry.has)
    });
  });

  describe(`hasCascading root`, () => {
    it(`returns true when setCascadeRoot was called on the current registry`, async () => {
      // const { registry, token, container } = setup();
      //
      // expect(registry.hasOwnCascadingRoot(token.id)).toEqual(false);
      //
      // registry.setCascadeRoot(token, container);
      //
      // expect(registry.hasOwnCascadingRoot(token.id)).toEqual(true);
      //
      // const childRegistry = registry.checkoutForScope();
      //
      // expect(childRegistry.hasOwnCascadingRoot(token.id)).toEqual(false);
      // childRegistry.setCascadeRoot(token, container);
      //
      // expect(childRegistry.hasOwnCascadingRoot(token.id)).toEqual(true);
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
