import {
  IApplication,
  IApplicationRoute,
  HttpMethod,
  HttpRequest,
  IHandler,
  RouteDefinition,
} from '@roro/s-middleware';
import { serverUnit } from '../../testing/helpers';
import { container } from '@hardwired/di';

describe(`ApplicationResolver`, () => {
  class DummyApp implements IApplication {
    public routes: any[] = [];

    addRoute(routeDefinition: RouteDefinition<any, any>, handler: (request: HttpRequest) => any) {}

    replaceRoutes(routes: IApplicationRoute<any, any>[]) {
      this.routes = [...routes];
    }

    run(): Promise<any> | any {
      return undefined;
    }
  }

  function buildHandler(data): new (...args: any[]) => IHandler<any> {
    return class {
      run() {
        return { data };
      }
    };
  }

  function buildRouteDefinition(pathDefinition: string, httpMethod: HttpMethod): RouteDefinition<any, any> {
    return {
      type: 'query',
      httpMethod,
      pathDefinition,
      defaultQueryParams: [],
    };
  }

  describe(`handlers discovery`, () => {
    const h1RouteDefinition = buildRouteDefinition('h1PathDefinition', HttpMethod.POST);
    const h2RouteDefinition = buildRouteDefinition('h2PathDefinition', HttpMethod.POST);

    const m = serverUnit('test')
      .app('app', DummyApp)
      .handler('h1', h1RouteDefinition, buildHandler('h1Response'))
      .handler('h2', h2RouteDefinition, buildHandler('h2Response'));
    const c = container(m);

    it(`caches app instance`, async () => {
      expect(c.get('app')).toBe(c.get('app'));
    });

    it(`calls replaceRoutes with correct params`, async () => {
      const app = c.get('app');
      jest.spyOn(app, 'replaceRoutes');

      c.get('app');
      expect(app.replaceRoutes).toHaveBeenCalledWith([
        {
          handler: expect.any(Function),
          routeDefinition: h1RouteDefinition,
        },
        {
          handler: expect.any(Function),
          routeDefinition: h2RouteDefinition,
        },
      ]);
    });

    it(`returns correct responses`, async () => {
      const app = c.get('app');

      expect(await app.routes[0].handler({ request: 'request' })).toEqual({ data: 'h1Response' });
      expect(await app.routes[1].handler({ request: 'request' })).toEqual({ data: 'h2Response' });
    });
  });
});
