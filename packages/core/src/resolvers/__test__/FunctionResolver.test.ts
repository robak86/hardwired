import { unit } from '../../module/Module';
import { dependency, TestTransientResolver } from '../../testing/TestResolvers';
import { container } from '../../container/Container';
import { func } from '../FunctionResolver';
import { transient } from '../ClassTransientResolver';
import { expectType, TypeEqual } from 'ts-expect';
import { Instance } from '../abstract/AbstractResolvers';
import { TestClass } from '../../module/__test__/ModuleBuilderPerf';

describe(`FunctionResolver`, () => {
  function setup() {
    const singletonResolver = dependency(123);
    const singletonFactorySpy = jest.spyOn(singletonResolver, 'build');

    const transientFactorySpy = jest.fn().mockImplementation(() => Math.random());
    const transientResolver = new TestTransientResolver(transientFactorySpy);

    const m = unit('test').define('singleton', singletonResolver).define('transient', transientResolver);

    return { module: m, singletonFactorySpy, transientFactorySpy };
  }

  describe(`func`, () => {
    const testFunction = (a: '1', b: '2', c: '3') => 123;

    it(`curry 0`, async () => {
      const s = func(testFunction, 0);
      expectType<TypeEqual<typeof s, Instance<typeof testFunction, []>>>(true);
    });

    it(`curry 1`, async () => {
      const s = func(testFunction, 1);
      expectType<TypeEqual<typeof s, Instance<(b: '2', c: '3') => number, ['1']>>>(true);
    });

    it(`curry 2`, async () => {
      const s = func(testFunction, 2);
      expectType<TypeEqual<typeof s, Instance<(c: '3') => number, ['1', '2']>>>(true);
    });

    it(`curry 3`, async () => {
      const s = func(testFunction, 3);
      expectType<TypeEqual<typeof s, Instance<() => number, ['1', '2', '3']>>>(true);
    });
  });

  describe(`memoization`, () => {
    describe(`no partially applied arguments`, () => {
      it(`returns the same instance of the function`, async () => {
        const { module } = setup();
        const someFunction = (a: number) => Math.random();

        const set = module.define('fn', func(someFunction, 0));

        const c = container(set);

        const fnBuild1 = c.get('fn');
        const fnBuild2 = c.get('fn');

        expect(fnBuild1).toBe(fnBuild2);
      });
    });

    describe(`using partially applied singleton dependency`, () => {
      it(`returns the same instance of the function`, async () => {
        const { module, singletonFactorySpy } = setup();
        const someFunction = (a: number) => a;

        const set = module.define('fn', func(someFunction, 1), ['singleton']);
        const c = container(set);

        const fnBuild1 = c.get('fn');
        const fnBuild2 = c.get('fn');
        const singleton = c.get('singleton');

        expect(singletonFactorySpy).toHaveBeenCalledTimes(3);
        expect(fnBuild1).toBe(fnBuild2);
        expect(fnBuild1()).toEqual(singleton);
        expect(fnBuild2()).toEqual(singleton);
      });
    });

    describe(`using partially applied transient dependency`, () => {
      it(`returns new instance of the function`, async () => {
        const { module, transientFactorySpy } = setup();
        const someFunction = (a: number) => a;

        const set = module.define('fn', func(someFunction, 1), ['transient']);

        const c = container(set);

        const fnBuild1 = c.get('fn');
        const fnBuild2 = c.get('fn');

        expect(transientFactorySpy).toHaveBeenCalledTimes(2);
        expect(fnBuild1).not.toBe(fnBuild2);
        expect(fnBuild1()).not.toEqual(fnBuild2());
      });
    });

    describe(`using partially applied transient and singleton dependency`, () => {
      it(`returns new instance of the function`, async () => {
        const { module, singletonFactorySpy, transientFactorySpy } = setup();
        const someFunction = (a: number, b: number) => [a, b];

        const set = module.define('fn', func(someFunction, 2), ['transient', 'singleton']);
        const c = container(set);

        const fnBuild1 = c.get('fn');
        const fnBuild2 = c.get('fn');

        expect(singletonFactorySpy).toHaveBeenCalledTimes(2);
        expect(transientFactorySpy).toHaveBeenCalledTimes(2);

        expect(fnBuild1).not.toBe(fnBuild2);
        expect(fnBuild1()).not.toEqual(fnBuild2());
      });
    });
  });
});
