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
});
