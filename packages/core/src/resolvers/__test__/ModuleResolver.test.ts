import { AbstractDependencyResolver } from '../abstract/AbstractDependencyResolver';
import { ModuleLookup } from '../../module/ModuleLookup';
import { module, unit } from '../../module/Module';

import { ContainerContext } from '../../container/ContainerContext';
import { singleton, singletonNew } from '../ClassSingletonResolver';
import { value, valueNew, ValueResolverNew } from '../ValueResolver';
import { container } from '../../container/Container';
import { AbstractInstanceResolver } from '../abstract/AbstractResolvers';
import { moduleImport } from '../../module/ModuleBuilder';

describe(`ModuleResolver`, () => {
  class DummyResolver<TValue> extends AbstractDependencyResolver<TValue> {
    constructor(private value: TValue) {
      super();
    }

    build(containerCache: ContainerContext): TValue {
      return this.value;
    }

    onInit(registry: ModuleLookup<any>) {}
  }

  const dependency = <TValue>(value: TValue): ValueResolverNew<TValue> => {
    return new ValueResolverNew<TValue>(value);
  };

  it(`returns correct registry object`, async () => {
    const dependencyA = dependency(123);
    const dependencyB = dependency(true);

    const m = module('someName').define('a', dependencyA).define('b', dependencyB);

    const containerContext = ContainerContext.empty();
    containerContext.loadModule(m);
    containerContext.initModule(m);

    const { registry } = containerContext.getModule(m.moduleId);

    expect(Object.keys(registry)).toEqual(['a', 'b']);
    expect(registry.a.get).toBeInstanceOf(Function);
    expect(registry.b.get).toBeInstanceOf(Function);
  });

  it(`calls dependencyResolver.onInit with parameter of type ModuleRegistry`, async () => {
    const dependencyA = dependency(123);
    const dependencyB = dependency(true);

    const buildASpy = jest.spyOn(dependencyA, 'onInit');
    const buildBSpy = jest.spyOn(dependencyB, 'onInit');

    const m = module('someName').define('a', dependencyA).define('b', dependencyB);

    const containerContext = ContainerContext.empty();
    containerContext.loadModule(m);
    containerContext.initModule(m);

    expect(buildASpy.mock.calls[0][0]).toBeInstanceOf(ModuleLookup);
    expect(buildBSpy.mock.calls[0][0]).toBeInstanceOf(ModuleLookup);
  });

  it(`returns Instance functions delegating to resolvers`, async () => {
    const dependencyA = dependency(123);
    const dependencyB = dependency(true);

    const buildAFactorySpy = jest.spyOn(dependencyA, 'build');
    const buildBFactorySpy = jest.spyOn(dependencyB, 'build');

    const m = module('someName').define('a', dependencyA).define('b', dependencyB);

    const containerContext = ContainerContext.empty();
    containerContext.loadModule(m);
    containerContext.initModule(m);
    const { registry } = containerContext.getModule(m.moduleId);

    registry.a.get(containerContext);
    registry.b.get(containerContext);

    expect(buildAFactorySpy).toHaveBeenCalledWith(containerContext);
    expect(buildBFactorySpy).toHaveBeenCalledWith(containerContext);
  });

  it(`returns Instance functions returning correct values`, async () => {
    const dependencyA = dependency(123);
    const dependencyB = dependency(true);

    jest.spyOn(dependencyA, 'build').mockReturnValue(123);
    jest.spyOn(dependencyB, 'build').mockReturnValue(false);

    const m = module('someName').define('a', dependencyA).define('b', dependencyB);

    const containerContext = ContainerContext.empty();
    containerContext.loadModule(m);
    containerContext.initModule(m);
    const { registry } = containerContext.getModule(m.moduleId);

    expect(registry.a.get(containerContext)).toEqual(123);
    expect(registry.b.get(containerContext)).toEqual(false);
  });

  it(`returns correct value for replaced value`, async () => {
    const m = module('someName').define('a', dependency(1)).replace('a', dependency(2));

    const containerContext = ContainerContext.empty();
    containerContext.loadModule(m);
    containerContext.initModule(m);
    const { registry } = containerContext.getModule(m.moduleId);

    const replacedValue = registry.a.get(containerContext);
    expect(replacedValue).toEqual(2);
  });

  describe(`injections`, () => {
    class ValueWrapper {
      constructor(public value) {}
    }

    it(`resolves correct dependencies using injections`, async () => {
      const parent = unit('parent')
        .define(
          'imported',
          moduleImport(() => child),
        )
        .define('aFromImported', singletonNew(ValueWrapper), ['imported.a']);

      const child = unit('child') //breakme
        .define('a', valueNew(123));

      const updatedChild = child.replace('a', valueNew(456));
      const parentWithInjectedChild = parent.inject(updatedChild);

      expect(container(parentWithInjectedChild).get('aFromImported').value).toEqual(456);
    });

    it(`resolves correct dependencies using multiple injections on the same module `, async () => {
      const parent = unit('parent')
        .define(
          'imported',
          moduleImport(() => child),
        )
        .define('aFromImported', singletonNew(ValueWrapper), ['imported.a']);

      const child = unit('child') //breakme
        .define('a', valueNew(123));

      const updatedChild = child.replace('a', valueNew(456));
      const parentWithInjectedChild = parent.inject(updatedChild);
      const parentWithInjectedChild2 = parent.inject(updatedChild);

      expect(container(parentWithInjectedChild).get('aFromImported').value).toEqual(456);
      expect(container(parentWithInjectedChild2).get('aFromImported').value).toEqual(456);
    });

    it(`resolves correct dependencies using deepGet`, async () => {
      const parent = unit('parent')
        .define(
          'imported',
          moduleImport(() => child),
        )
        .define('aFromImported', singletonNew(ValueWrapper), ['imported.a']);

      const child = unit('child') //breakme
        .define('a', valueNew(123));

      const updatedChild = child.replace('a', valueNew(456));
      const parentWithInjectedChild = parent.inject(updatedChild);

      expect(container(parentWithInjectedChild).get(updatedChild, 'a')).toEqual(456);
    });

    it(`resolves correct dependencies replacing multiple modules with injections`, async () => {
      const parent = unit('parent')
        // imports
        .define(
          'child',
          moduleImport(() => child),
        )
        .define(
          'grandChild',
          moduleImport(() => grandChild),
        )

        .define('ownGrandChild', singletonNew(ValueWrapper), ['grandChild.a'])
        .define('transientGrandChild', singletonNew(ValueWrapper), ['child.grandChildValue']);

      const child = unit('child') //breakme
        .define(
          'grandChild',
          moduleImport(() => grandChild),
        )
        .define('grandChildValue', singletonNew(ValueWrapper), ['grandChild.a']);

      const grandChild = unit('grandChild') //breakme
        .define('a', valueNew(123));

      expect(container(parent).get('ownGrandChild').value).toEqual(123);
      expect(container(parent).get('transientGrandChild').value.value).toEqual(123);

      const updatedChild = grandChild.replace('a', valueNew(456));
      const parentWithInjectedChild = parent.inject(updatedChild);

      expect(container(parentWithInjectedChild).get('ownGrandChild').value).toEqual(456);
      expect(container(parentWithInjectedChild).get('transientGrandChild').value.value).toEqual(456);
    });
  });
});
