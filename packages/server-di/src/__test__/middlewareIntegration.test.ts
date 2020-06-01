import { serverUnit } from '../testing/helpers';
import { IMiddleware } from '../types/Middleware';
import { container } from '@hardwired/di';

describe(`.middleware`, () => {
  function buildMiddleware<Type extends string>(type: Type, outputFn?: (deps: any[]) => any) {
    const constructorSpy = jest.fn();
    const runSpy = jest.fn();

    class Middleware implements IMiddleware<any> {
      type: Type = type;
      dependencies: any[];

      constructor(...args: any[]) {
        this.dependencies = args;
        constructorSpy(args);
      }

      run() {
        runSpy(this.dependencies);
        return outputFn ? outputFn(this.dependencies) : this.dependencies;
      }
    }

    return { constructorSpy, runSpy, Middleware };
  }

  describe(`single middleware`, () => {
    it(`uses injected request object`, async () => {
      const { Middleware: DummyMiddleware } = buildMiddleware('type');

      const m = serverUnit('m')
        .replace('request', () => 1 as any)
        .middleware('m1', DummyMiddleware, ctx => [ctx.request]);
      const c = container(m);

      const middlewareOutput = await c.get('m1');
      expect(middlewareOutput).toEqual([1]);
    });
  });

  describe(`single handler`, () => {
    it(`uses correctly injected request object`, async () => {
      const { Middleware: DummyMiddleware } = buildMiddleware('type');

      const m = serverUnit('m').handler('h1', {}, DummyMiddleware, ctx => [ctx.request]);
      const c = container(m);

      const middlewareOutput = await c.get('h1').request({ request: 'dummyRequest' });
      expect(middlewareOutput).toEqual([{ request: 'dummyRequest' }]);
    });
  });

  describe(`handler using middleware`, () => {
    describe(`request injection`, () => {
      it(`uses correctly injected request object`, async () => {
        const { Middleware: DummyHandler } = buildMiddleware('type');
        const { Middleware: DummyMiddleware } = buildMiddleware('type');

        const m = serverUnit('m')
          .middleware('m1', DummyMiddleware, ctx => [ctx.request])
          .handler('h1', {}, DummyHandler, ctx => [ctx.request, ctx.m1]);

        const c = container(m);

        const middlewareOutput = await c.get('h1').request({ request: 'dummyRequest' });
        expect(middlewareOutput).toEqual([{ request: 'dummyRequest' }, [{ request: 'dummyRequest' }]]);
      });

      it(`caches output of middlewares`, async () => {
        const {
          Middleware: SharedMiddleware,
          constructorSpy: sharedMiddlewareConstructor,
          runSpy: sharedRunSpy,
        } = buildMiddleware('shared', () => 'shared');
        const { Middleware: M1, constructorSpy: m1ConstructorSpy, runSpy: m1RunSpy } = buildMiddleware('m1', deps => [
          ...deps,
          'm1',
        ]);
        const { Middleware: M2, constructorSpy: m2ConstructorSpy, runSpy: m2RunSpy } = buildMiddleware('m1', deps => [
          ...deps,
          'm2',
        ]);

        const { Middleware: DummyHandler } = buildMiddleware('type');

        const m = serverUnit('m')
          .middleware('shared', SharedMiddleware)
          .middleware('m1', M1, ctx => [ctx.shared])
          .middleware('m2', M2, ctx => [ctx.shared])
          .handler('h1', {}, DummyHandler, ctx => [ctx.m1, ctx.m2]);

        const c = container(m);
        const response = await c.get('h1').request({ request: 'request' });
        expect(response).toEqual([
          ['shared', 'm1'],
          ['shared', 'm2'],
        ]);

        expect(m1ConstructorSpy).toHaveBeenCalledTimes(1);
        expect(m2ConstructorSpy).toHaveBeenCalledTimes(1);
        expect(sharedMiddlewareConstructor).toHaveBeenCalledTimes(1);
      });
    });
  });
});
