import { IApplication, IApplicationRoute } from '../../types/App';
import { HttpMethod, HttpRequest, IHandler, RouteDefinition } from '../../types/Middleware';
import { serverUnit } from '../../testing/helpers';
import { container } from '@hardwired/di';

describe(`ApplicationResolver`, () => {
  class DummyApp implements IApplication {
    public routes: any[] = [];

    addRoute(method: HttpMethod, path: string, handler: (request: HttpRequest) => any) {}

    replaceRoutes(routes: IApplicationRoute[]) {
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
      httpMethod,
      pathDefinition,
    };
  }

  describe(`handlers discovery`, () => {
    const m = serverUnit('test')
      .app('app', DummyApp)
      .handler('h1', buildRouteDefinition('h1PathDefinition', 'post'), buildHandler('h1Response'))
      .handler('h2', buildRouteDefinition('h2PathDefinition', 'post'), buildHandler('h2Response'));
    const c = container(m);

    it(`calls replaceRoutes with correct params`, async () => {
      const app = c.get('app');
      jest.spyOn(app, 'replaceRoutes');

      c.get('app');
      expect(app.replaceRoutes).toHaveBeenCalledWith([
        {
          handler: expect.any(Function),
          httpMethod: 'post',
          pathDefinition: 'h1PathDefinition',
        },
        {
          handler: expect.any(Function),
          httpMethod: 'post',
          pathDefinition: 'h2PathDefinition',
        },
      ]);
    });
  });
});
