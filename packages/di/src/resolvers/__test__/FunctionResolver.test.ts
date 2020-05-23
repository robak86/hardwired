import { DefinitionsSet } from '../../module/DefinitionsSet';
import { GlobalSingletonResolver } from '../global-singleton-resolver';
import { ContainerCache } from '../../container/container-cache';
import { FunctionResolver } from '../FunctionResolver';

describe(`FunctionResolver`, () => {
  function setup() {
    const singletonFactorySpy = jest.fn().mockImplementation(() => Math.random());
    const singletonResolver = new GlobalSingletonResolver(singletonFactorySpy);

    const transientFactorySpy = jest.fn().mockImplementation(() => Math.random());
    const transientResolver = new GlobalSingletonResolver(singletonFactorySpy);

    const definitionsSet = DefinitionsSet.empty('test')
      .extendDeclarations('singleton', singletonResolver)
      .extendDeclarations('transient', transientResolver);

    const cache = new ContainerCache();

    return { definitionsSet, singletonFactorySpy, transientFactorySpy, cache };
  }

  describe(`memoization`, () => {
    it(`memoize curried function`, async () => {
      const { cache, definitionsSet } = setup();
      const someFunction = (a: number) => Math.random();

      const set = definitionsSet.extendDeclarations('fn', new FunctionResolver(someFunction, ctx => []));


    });
  });
});
