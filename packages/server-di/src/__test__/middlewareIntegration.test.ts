import { serverUnit } from '../testing/helpers';
import { Task, ContractRouteDefinition } from '@roro/s-middleware';
import { container, commonDefines } from '@hardwired/di';
import { serverDefinitions } from '../builders/ServerModuleBuilder';

describe(`.task`, () => {
  function buildMiddleware<Type extends string>(type: Type, outputFn?: (deps: any[]) => any) {
    const constructorSpy = jest.fn();
    const runSpy = jest.fn();

    class Middleware implements Task<any> {
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
        .task('m1', DummyMiddleware, ctx => [ctx.request]);
      const c = container(m);

      const middlewareOutput = await c.get('m1');
      expect(middlewareOutput).toEqual([1]);
    });
  });

  describe(`single handler`, () => {
    it(`uses correctly injected request object`, async () => {
      const { Middleware: DummyMiddleware } = buildMiddleware('type');

      const m = serverUnit('m').handler('h1', ContractRouteDefinition.empty(), DummyMiddleware, ctx => [ctx.request]);
      const c = container(m);

      const middlewareOutput = await c.get('h1').request({ request: 'dummyRequest' } as any);
      expect(middlewareOutput).toEqual([{ request: 'dummyRequest' }]);
    });

    it(`caches handlers`, async () => {
      const { Middleware: DummyMiddleware } = buildMiddleware('type');

      const m = serverUnit('m').handler('h1', ContractRouteDefinition.empty(), DummyMiddleware, ctx => [ctx.request]);
      const c = container(m);

      const handler = await c.get('h1');
      const handlerTheSecond = await c.get('h1');
      expect(handler).toBe(handlerTheSecond);
    });
  });

  describe(`handler using middleware`, () => {
    describe(`request injection`, () => {
      it(`uses correctly injected request object`, async () => {
        const { Middleware: DummyHandler } = buildMiddleware('type');
        const { Middleware: DummyMiddleware } = buildMiddleware('type');

        const m = serverUnit('m')
          .task('m1', DummyMiddleware, ctx => [ctx.request])
          .handler('h1', ContractRouteDefinition.empty(), DummyHandler, ctx => [ctx.request, ctx.m1]);

        const c = container(m);

        const middlewareOutput = await c.get('h1').request({ request: 'dummyRequest' } as any);
        expect(middlewareOutput).toEqual([{ request: 'dummyRequest' }, [{ request: 'dummyRequest' }]]);
      });

      describe(`shared dependency is imported by the next level of middlewares`, () => {
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
            .task('shared', SharedMiddleware)
            .task('m1', M1, ctx => [ctx.shared])
            .task('m2', M2, ctx => [ctx.shared])
            .handler('h1', ContractRouteDefinition.empty(), DummyHandler, ctx => [ctx.m1, ctx.m2]);

          const c = container(m);
          const response = await c.get('h1').request({ request: 'request' } as any);
          expect(response).toEqual([
            ['shared', 'm1'],
            ['shared', 'm2'],
          ]);

          expect(m1ConstructorSpy).toHaveBeenCalledTimes(1);
          expect(m1RunSpy).toHaveBeenCalledTimes(1);
          expect(m2ConstructorSpy).toHaveBeenCalledTimes(1);
          expect(m2RunSpy).toHaveBeenCalledTimes(1);
          expect(sharedMiddlewareConstructor).toHaveBeenCalledTimes(1);
          expect(sharedRunSpy).toHaveBeenCalledTimes(1);
        });
      });

      describe(`shared middleware is imported by multiple levels of next middlewares`, () => {
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

          const { Middleware: M3, constructorSpy: m3ConstructorSpy, runSpy: m3RunSpy } = buildMiddleware('m3', deps => [
            ...deps,
            'm3',
          ]);

          const { Middleware: DummyHandler } = buildMiddleware('type');

          const m = serverUnit('m')
            .task('shared', SharedMiddleware)
            .task('m1', M1, ctx => [ctx.shared])
            .task('m2', M2, ctx => [ctx.shared])
            .task('m3', M3, ctx => [ctx.m2])
            .handler('h1', ContractRouteDefinition.empty(), DummyHandler, ctx => [ctx.m1, ctx.m3]);

          const c = container(m);
          const response = await c.get('h1').request({ request: 'request' } as any);
          expect(response).toEqual([
            ['shared', 'm1'],
            [['shared', 'm2'], 'm3'],
          ]);

          expect(m1ConstructorSpy).toHaveBeenCalledTimes(1);
          expect(m1RunSpy).toHaveBeenCalledTimes(1);
          expect(m2ConstructorSpy).toHaveBeenCalledTimes(1);
          expect(m2RunSpy).toHaveBeenCalledTimes(1);
          expect(m3ConstructorSpy).toHaveBeenCalledTimes(1);
          expect(m3RunSpy).toHaveBeenCalledTimes(1);
          expect(sharedMiddlewareConstructor).toHaveBeenCalledTimes(1);
          expect(sharedRunSpy).toHaveBeenCalledTimes(1);
        });
      });

      describe(`shared middleware is imported from other module`, () => {
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

          const { Middleware: M3, constructorSpy: m3ConstructorSpy, runSpy: m3RunSpy } = buildMiddleware('m3', deps => [
            ...deps,
            'm3',
          ]);

          const { Middleware: DummyHandler } = buildMiddleware('type');

          const sharedM = serverUnit('shared').task('shared', SharedMiddleware);

          const m2Module = serverUnit('middlewares')
            .using(commonDefines)
            .import('otherModule', sharedM)
            .using(serverDefinitions)
            .task('m2', M2, ctx => [ctx.otherModule.shared]);

          const m = serverUnit('m')
            .using(commonDefines)
            .import('otherModule', sharedM)
            .import('otherMiddlewares', m2Module)
            .using(serverDefinitions)
            .task('m1', M1, ctx => [ctx.otherModule.shared])
            .task('m3', M3, ctx => [ctx.otherMiddlewares.m2])
            .handler('h1', ContractRouteDefinition.empty(), DummyHandler, ctx => [ctx.m1, ctx.m3]);

          const c = container(m);
          const response = await c.get('h1').request({ request: 'request' } as any);
          console.log(response);
          expect(response).toEqual([
            ['shared', 'm1'],
            [['shared', 'm2'], 'm3'],
          ]);

          expect(m1ConstructorSpy).toHaveBeenCalledTimes(1);
          expect(m1RunSpy).toHaveBeenCalledTimes(1);
          expect(m2ConstructorSpy).toHaveBeenCalledTimes(1);
          expect(m2RunSpy).toHaveBeenCalledTimes(1);
          expect(m3ConstructorSpy).toHaveBeenCalledTimes(1);
          expect(m3RunSpy).toHaveBeenCalledTimes(1);
          expect(sharedMiddlewareConstructor).toHaveBeenCalledTimes(1);
          expect(sharedRunSpy).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
});
