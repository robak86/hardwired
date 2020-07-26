import { ContainerCache, ContainerService, ModuleRegistry, } from '@hardwired/di-core';
import { FunctionResolver } from '../FunctionResolver';
import { SingletonResolver } from '../SingletonResolver';
import { TransientResolver } from '../TransientResolver';

describe(`FunctionResolver`, () => {
  function setup() {
    const singletonFactorySpy = jest.fn().mockImplementation(() => Math.random());
    const singletonResolver = new SingletonResolver(singletonFactorySpy);

    const transientFactorySpy = jest.fn().mockImplementation(() => Math.random());
    const transientResolver = new TransientResolver(transientFactorySpy);

    const moduleRegistry = ModuleRegistry.empty('test')
      .extendDeclarations('singleton', singletonResolver)
      .extendDeclarations('transient', transientResolver);

    const cache = new ContainerCache();

    return { moduleRegistry, singletonFactorySpy, transientFactorySpy, cache };
  }

  describe(`memoization`, () => {
    describe(`no partially applied arguments`, () => {
      it(`returns the same instance of the function`, async () => {
        const { cache, moduleRegistry } = setup();
        const someFunction = (a: number) => Math.random();

        const set = moduleRegistry.extendDeclarations('fn', new FunctionResolver(someFunction, ctx => []));

        const fnBuild1 = ContainerService.getChild(set, cache, {}, 'fn');
        const fnBuild2 = ContainerService.getChild(set, cache, {}, 'fn');

        expect(fnBuild1).toBe(fnBuild2);
      });
    });

    describe(`using partially applied singleton dependency`, () => {
      it(`returns the same instance of the function`, async () => {
        const { cache, moduleRegistry, singletonFactorySpy } = setup();
        const someFunction = (a: number) => a;

        const set = moduleRegistry.extendDeclarations('fn', new FunctionResolver(someFunction, ctx => [ctx.singleton]));

        const fnBuild1 = ContainerService.getChild(set, cache, {}, 'fn');
        const fnBuild2 = ContainerService.getChild(set, cache, {}, 'fn');
        const singleton = ContainerService.getChild(set, cache, {}, 'singleton');

        expect(singletonFactorySpy).toHaveBeenCalledTimes(1);
        expect(fnBuild1).toBe(fnBuild2);
        expect(fnBuild1()).toEqual(singleton);
        expect(fnBuild2()).toEqual(singleton);
      });
    });

    describe(`using partially applied transient dependency`, () => {
      it(`returns new instance of the function`, async () => {
        const { cache, moduleRegistry, transientFactorySpy } = setup();
        const someFunction = (a: number) => a;

        const set = moduleRegistry.extendDeclarations('fn', new FunctionResolver(someFunction, ctx => [ctx.transient]));

        const fnBuild1 = ContainerService.getChild(set, cache, {}, 'fn');
        const fnBuild2 = ContainerService.getChild(set, cache, {}, 'fn');

        expect(transientFactorySpy).toHaveBeenCalledTimes(2);
        expect(fnBuild1).not.toBe(fnBuild2);
        expect(fnBuild1()).not.toEqual(fnBuild2());
      });
    });

    describe(`using partially applied transient and singleton dependency`, () => {
      it(`returns new instance of the function`, async () => {
        const { cache, moduleRegistry, singletonFactorySpy, transientFactorySpy } = setup();
        const someFunction = (a: number, b: number) => [a, b];

        const set = moduleRegistry.extendDeclarations(
          'fn',
          new FunctionResolver(someFunction, ctx => [ctx.transient, ctx.singleton]),
        );

        const fnBuild1 = ContainerService.getChild(set, cache, {}, 'fn');
        const fnBuild2 = ContainerService.getChild(set, cache, {}, 'fn');

        expect(singletonFactorySpy).toHaveBeenCalledTimes(1);
        expect(transientFactorySpy).toHaveBeenCalledTimes(2);

        expect(fnBuild1).not.toBe(fnBuild2);
        expect(fnBuild1()).not.toEqual(fnBuild2());
      });
    });
  });
});
