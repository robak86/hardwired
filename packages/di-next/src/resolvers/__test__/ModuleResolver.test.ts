import { AbstractDependencyResolver } from "../AbstractDependencyResolver";
import { ModuleRegistry } from "../../module/ModuleRegistry";
import { ModuleBuilder } from "../../builders/ModuleBuilder";
import { ModuleResolver } from "../ModuleResolver";
import { ContainerCache } from "../../container/container-cache";

describe(`ModuleResolver`, () => {
  class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
    constructor(private value: TValue) {
      super();
    }

    build(containerCache: ContainerCache): TValue {
      return this.value;
    }

    onInit(registry: ModuleRegistry<any>) {}
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
    const registry = resolver.build();
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
    const registry = resolver.build();

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
    const registry = resolver.build();

    expect(registry.a(containerCache)).toEqual(123);
    expect(registry.b(containerCache)).toEqual(false);
  });

  it(`returns correct value for replaced value`, async () => {
    const m = ModuleBuilder.empty('someName')
      .define('a', ctx => dependency(1))
      .replace('a', ctx => dependency(2));

    const resolver = new ModuleResolver(m);
    const replacedValue = resolver.build().a(new ContainerCache());
    expect(replacedValue).toEqual(2);
  });
});
