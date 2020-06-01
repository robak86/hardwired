import { serverUnit } from '../testing/helpers';
import { IMiddleware } from '../types/Middleware';
import { container } from '@hardwired/di';

describe(`.middleware`, () => {
  function buildMiddleware<Type extends string>(type: Type) {
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
        return this.dependencies;
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
          .middleware('m1', DummyMiddleware)
          .handler('h1', {}, DummyHandler, ctx => [ctx.request, ctx.m1]);

        const c = container(m);

        const middlewareOutput = await c.get('h1').request({ request: 'dummyRequest' });
        expect(middlewareOutput).toEqual([{ request: 'dummyRequest' }, [{ request: 'dummyRequest' }]]);
      });
    });
  });
});
