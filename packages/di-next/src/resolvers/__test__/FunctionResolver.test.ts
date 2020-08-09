import { func, FunctionResolver } from '../FunctionResolver';
import { TransientResolver } from '../TransientResolver';
import { unit } from '../../builders/ModuleBuilder';
import { dependency } from '../../testing/TestResolvers';
import { container } from '../../container/Container';

describe(`FunctionResolver`, () => {
  function setup() {
    const singletonResolver = dependency(123);
    const singletonFactorySpy = jest.spyOn(singletonResolver, 'build');

    const transientFactorySpy = jest.fn().mockImplementation(() => Math.random());
    const transientResolver = new TransientResolver(transientFactorySpy);

    const m = unit('test')
      .define('singleton', _ => singletonResolver)
      .define('transient', _ => transientResolver);

    return { module: m, singletonFactorySpy, transientFactorySpy };
  }

  describe(`memoization`, () => {
    describe(`no partially applied arguments`, () => {
      it(`returns the same instance of the function`, async () => {
        const { module } = setup();
        const someFunction = (a: number) => Math.random();

        const set = module.define('fn', ctx => func(someFunction));

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

        const set = module.define('fn', ctx => func(someFunction, [ctx.singleton]));
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

        const set = module.define('fn', ctx => func(someFunction, [ctx.transient]));

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

        const set = module.define('fn', ctx => func(someFunction, [ctx.transient, ctx.singleton]));
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