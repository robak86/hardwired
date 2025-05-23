import { ScopeRegistry } from '../ScopeRegistry.js';

describe(`ScopeRegistry`, () => {
  it(`does not inherit overrides`, async () => {
    const registry = ScopeRegistry.create<string>();

    const symbol = Symbol('test');

    registry.register(symbol, 'init');
    registry.override(symbol, 'overridden');

    expect(registry.get(symbol)).toBe('overridden');

    const childRegistry = registry.checkoutForScope();

    expect(childRegistry.get(symbol)).toBe('init');
  });

  it(`throws on registering already registered definition`, async () => {
    const registry = ScopeRegistry.create<string>();

    const symbol = Symbol('test');

    registry.register(symbol, 'init');

    expect(() => {
      registry.register(symbol, 'overridden');
    }).toThrowError(`Instance with id ${symbol.toString()} already registered. Try using .modify() instead.`);
  });

  it(`allows multiple override`, async () => {
    const registry = ScopeRegistry.create<string>();

    const symbol = Symbol('test');

    registry.register(symbol, 'init');
    registry.override(symbol, 'overridden1');
    registry.override(symbol, 'overridden2');

    expect(registry.get(symbol)).toBe('overridden2');
  });

  it(`throws on overriding not registered definition`, async () => {
    const registry = ScopeRegistry.create<string>();

    const symbol = Symbol('test');

    expect(() => {
      registry.override(symbol, 'overridden');
    }).toThrowError(`Instance with id ${symbol.toString()} not registered. Try using .register() instead.`);
  });

  describe(`delegation to the prev registry`, () => {
    it(`delegates findRegistration to _prev ScopeRegistry`, async () => {
      const parentRegistry = ScopeRegistry.create<string>();
      const childRegistry = ScopeRegistry.create<string>().withParent(parentRegistry);

      const symbol = Symbol('test');

      parentRegistry.register(symbol, 'parentValue');

      expect(childRegistry.findRegistration(symbol)).toBe('parentValue');
    });

    it(`delegates findOverride to _prev ScopeRegistry`, async () => {
      const parentRegistry = ScopeRegistry.create<string>();
      const childRegistry = ScopeRegistry.create<string>().withParent(parentRegistry);

      const symbol = Symbol('test');

      parentRegistry.register(symbol, 'parentValue');
      parentRegistry.override(symbol, 'parentOverride');

      expect(parentRegistry.findOverride(symbol)).toBe('parentOverride');

      expect(childRegistry.findOverride(symbol)).toBe('parentOverride');
    });

    it(`delegates find to _prev ScopeRegistry`, async () => {
      const parentRegistry = ScopeRegistry.create<string>();
      const childRegistry = ScopeRegistry.create<string>().withParent(parentRegistry);

      const symbol = Symbol('test');

      parentRegistry.register(symbol, 'parentValue');
      parentRegistry.override(symbol, 'parentOverride');

      expect(childRegistry.find(symbol)).toBe('parentOverride');
    });

    it(`throws when get is called and _prev ScopeRegistry does not have the definition`, async () => {
      const parentRegistry = ScopeRegistry.create<string>();
      const childRegistry = ScopeRegistry.create<string>().withParent(parentRegistry);

      const symbol = Symbol('test');

      expect(() => childRegistry.get(symbol)).toThrowError(`No definition registered for ${symbol.toString()}`);
    });

    it(`allows get to retrieve definitions from _prev ScopeRegistry`, async () => {
      const parentRegistry = ScopeRegistry.create<string>();
      const childRegistry = ScopeRegistry.create<string>().withParent(parentRegistry);

      const symbol = Symbol('test');

      parentRegistry.register(symbol, 'parentValue');

      expect(childRegistry.get(symbol)).toBe('parentValue');
    });
  });

  describe(`resolving values from linked hierarchy`, () => {
    it(`uses child registry's own registration over parent registry's`, async () => {
      const parentRegistry = ScopeRegistry.create<string>();
      const childRegistry = ScopeRegistry.create<string>().withParent(parentRegistry);

      const symbol = Symbol('test');

      parentRegistry.register(symbol, 'parentValue');
      childRegistry.register(symbol, 'childValue');

      expect(childRegistry.get(symbol)).toBe('childValue');
    });

    it(`uses child registry's own override over parent registry's`, async () => {
      const parentRegistry = ScopeRegistry.create<string>();
      const childRegistry = ScopeRegistry.create<string>().withParent(parentRegistry);

      const symbol = Symbol('test');

      parentRegistry.register(symbol, 'parentValue');
      parentRegistry.override(symbol, 'parentOverride');
      childRegistry.override(symbol, 'childOverride');

      expect(childRegistry.get(symbol)).toBe('childOverride');
    });

    it(`falls back to parent registry when child registry does not have its own registration`, async () => {
      const parentRegistry = ScopeRegistry.create<string>();
      const childRegistry = ScopeRegistry.create<string>().withParent(parentRegistry);

      const symbol = Symbol('test');

      parentRegistry.register(symbol, 'parentValue');

      expect(childRegistry.get(symbol)).toBe('parentValue');
    });

    it(`falls back to parent registry when child registry does not have its own override`, async () => {
      const parentRegistry = ScopeRegistry.create<string>();
      const childRegistry = ScopeRegistry.create<string>().withParent(parentRegistry);

      const symbol = Symbol('test');

      parentRegistry.register(symbol, 'parentValue');
      parentRegistry.override(symbol, 'parentOverride');

      expect(childRegistry.get(symbol)).toBe('parentOverride');
    });

    it(`throws when child registry has no registration and parent registry also lacks it`, async () => {
      const parentRegistry = ScopeRegistry.create<string>();
      const childRegistry = ScopeRegistry.create<string>().withParent(parentRegistry);

      const symbol = Symbol('test');

      expect(() => childRegistry.get(symbol)).toThrowError(`No definition registered for ${symbol.toString()}`);
    });
  });
});
