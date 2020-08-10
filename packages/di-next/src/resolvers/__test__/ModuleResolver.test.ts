import { AbstractDependencyResolver } from '../AbstractDependencyResolver';
import { ModuleRegistry } from '../../module/ModuleRegistry';
import { ModuleBuilder, unit } from '../../builders/ModuleBuilder';
import { moduleImport, ModuleResolver } from '../ModuleResolver';
import { ContainerCache } from '../../container/container-cache';
import { singleton } from '../ClassSingletonResolver';
import { value } from '../ValueResolver';
import { container } from '../../container/Container';

describe(`ModuleResolver`, () => {
  class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
    constructor(private value: TValue) {
      super();
    }

    build(containerCache: ContainerCache): TValue {
      return this.value;
    }

    onInit(registry: ModuleRegistry) {}
  }

  const dependency = <TValue>(value: TValue): DummyResolver<TValue> => {
    return new DummyResolver<TValue>(value);
  };

  it(`returns correct registry object`, async () => {
    const dependencyA = dependency(123);
    const dependencyB = dependency(true);

    const m = ModuleBuilder.empty('someName')
      .define('a', ctx => dependencyA)
      .define('b', ctx => dependencyB);

    const resolver = new ModuleResolver(m);
    const [registry, _] = resolver.build();
    expect(Object.keys(registry)).toEqual(['a', 'b']);
    expect(registry.a).toBeInstanceOf(Function);
    expect(registry.b).toBeInstanceOf(Function);
  });

  it(`calls dependencyResolver.onInit with parameter of type ModuleRegistry`, async () => {
    const dependencyA = dependency(123);
    const dependencyB = dependency(true);

    const buildASpy = jest.spyOn(dependencyA, 'onInit');
    const buildBSpy = jest.spyOn(dependencyB, 'onInit');

    const m = ModuleBuilder.empty('someName')
      .define('a', ctx => dependencyA)
      .define('b', ctx => dependencyB);

    const resolver = new ModuleResolver(m);

    resolver.build();
    expect(buildASpy.mock.calls[0][0]).toBeInstanceOf(ModuleRegistry);
    expect(buildBSpy.mock.calls[0][0]).toBeInstanceOf(ModuleRegistry);
  });

  it(`returns DependencyFactory functions delegating to resolvers`, async () => {
    const dependencyA = dependency(123);
    const dependencyB = dependency(true);

    const buildAFactorySpy = jest.spyOn(dependencyA, 'build');
    const buildBFactorySpy = jest.spyOn(dependencyB, 'build');

    const m = ModuleBuilder.empty('someName')
      .define('a', ctx => dependencyA)
      .define('b', ctx => dependencyB);

    const resolver = new ModuleResolver(m);
    const containerCache = new ContainerCache();
    const [registry, _] = resolver.build();

    registry.a(containerCache);
    registry.b(containerCache);

    expect(buildAFactorySpy).toHaveBeenCalledWith(containerCache);
    expect(buildBFactorySpy).toHaveBeenCalledWith(containerCache);
  });

  it(`returns DependencyFactory functions returning correct values`, async () => {
    const dependencyA = dependency(123);
    const dependencyB = dependency(true);

    jest.spyOn(dependencyA, 'build').mockReturnValue(123);
    jest.spyOn(dependencyB, 'build').mockReturnValue(false);

    const m = ModuleBuilder.empty('someName')
      .define('a', ctx => dependencyA)
      .define('b', ctx => dependencyB);

    const resolver = new ModuleResolver(m);
    const containerCache = new ContainerCache();
    const [registry, _] = resolver.build();

    expect(registry.a(containerCache)).toEqual(123);
    expect(registry.b(containerCache)).toEqual(false);
  });

  it(`returns correct value for replaced value`, async () => {
    const m = ModuleBuilder.empty('someName')
      .define('a', ctx => dependency(1))
      .replace('a', ctx => dependency(2));

    const resolver = new ModuleResolver(m);
    const [registry, _] = resolver.build();
    const replacedValue = registry.a(new ContainerCache());
    expect(replacedValue).toEqual(2);
  });

  describe(`injections`, () => {
    class ValueWrapper {
      constructor(public value) {}
    }

    it(`resolves correct dependencies using injections`, async () => {
      const parent = unit('parent')
        .define('imported', _ => moduleImport(child))
        .define('aFromImported', _ => singleton(ValueWrapper, [_.imported.a]));

      const child = unit('child') //breakme
        .define('a', _ => value(123));

      const updatedChild = child.replace('a', _ => value(456));
      const parentWithInjectedChild = parent.inject(updatedChild);

      expect(container(parentWithInjectedChild).get('aFromImported').value).toEqual(456);
    });

    it(`resolves correct dependencies replacing multiple modules with injections`, async () => {
      const parent = unit('parent')
        .define('child', _ => moduleImport(child))
        .define('grandChild', _ => moduleImport(grandChild))
        .define('ownGrandChild', _ => singleton(ValueWrapper, [_.grandChild.a]))
        .define('transientGrandChild', _ => singleton(ValueWrapper, [_.child.grandChildValue]));

      const child = unit('child') //breakme
        .define('grandChild', _ => moduleImport(grandChild))
        .define('grandChildValue', _ => singleton(ValueWrapper, [_.grandChild.a]));

      const grandChild = unit('grandChild') //breakme
        .define('a', _ => value(123));

      expect(container(parent).get('ownGrandChild').value).toEqual(123);
      expect(container(parent).get('transientGrandChild').value.value).toEqual(123);


      const updatedChild = grandChild.replace('a', _ => value(456));
      const parentWithInjectedChild = parent.inject(updatedChild);

      expect(container(parentWithInjectedChild).get('ownGrandChild').value).toEqual(456);
      expect(container(parentWithInjectedChild).get('transientGrandChild').value.value).toEqual(456);
    });
  });
});
