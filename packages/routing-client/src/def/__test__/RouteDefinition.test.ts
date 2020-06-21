import { RouteDefinition } from '../RouteDefinition';

describe('RouteDefinition', () => {
  describe('build', () => {
    it('creates route definition', () => {
      const definition = '/a/b/c';
      const route = RouteDefinition.build(definition);
      expect(route).toEqual({ definition });
    });

    it('accepts default parameters', () => {
      const definition = '/a/b/c';
      const defaultRouteParams = { pathParams: { p1: 'a' } };


      const route = RouteDefinition.build<{ p1?: string }, {}>(definition, {
        defaultRouteParams,
      });
      expect(route).toEqual({ definition, defaultRouteParams, defaultQueryParams: undefined });
    });
  });

  describe('toPath', () => {
    it('returns path definition', () => {
      const definition = '/a/:param1/:param2';
      const route = RouteDefinition.build(definition);
      expect(RouteDefinition.toPath(route)).toEqual('/a/:param1/:param2');
    });
  });

  describe('toUrl', () => {
    describe('no params', () => {
      const definition = '/a/b/c/d';
      const route = RouteDefinition.build(definition);
      expect(RouteDefinition.toUrl(route)).toEqual('/a/b/c/d');
    });

    describe('pathParams', () => {
      it('interpolates params', () => {
        const definition = '/user/:id';
        type TPathParams = { id: number };
        const route = RouteDefinition.build<TPathParams>(definition);

        expect(RouteDefinition.toUrl(route, { pathParams: { id: 1 } })).toEqual('/user/1');
      });
    });

    describe('queryParams', () => {
      it('interpolates params', () => {
        const definition = '/users/search';
        type TQueryParams = { id: string };
        const route = RouteDefinition.build<{}, TQueryParams>(definition);
        expect(RouteDefinition.toUrl(route, { queryParams: { id: '1' } })).toEqual('/users/search?id=1');
      });
    });

    describe('queryParams combined with pathParams', () => {
      it('returns correct url', () => {
        const definition = '/users/:userId/items';
        type TQueryParams = { id: string };
        type TPathParams = { userId: number };
        const route = RouteDefinition.build<TPathParams, TQueryParams>(definition);
        expect(RouteDefinition.toUrl(route, { pathParams: { userId: 123 }, queryParams: { id: '1' } })).toEqual(
          '/users/123/items?id=1',
        );
      });
    });

    describe('defaultRouteParams', () => {
      it('uses default properties for query params', () => {
        const route = RouteDefinition.build<
          { pathParam1: string; pathParam2: string },
          { optional3?: string; optional4?: string }
        >('/r1/:pathParam1/r2/:pathParam2', {
          defaultRouteParams: {
            queryParams: { optional3: 'default' },
          },
        });

        expect(RouteDefinition.toUrl(route, { pathParams: { pathParam1: 'a', pathParam2: 'b' } })).toEqual(
          '/r1/a/r2/b?optional3=default',
        );
      });

      it('merges default properties for query params with properties passed to toUrl function', () => {
        const route = RouteDefinition.build<
          { pathParam1: string; pathParam2: string },
          { optional3?: string; optional4?: string }
        >('/r1/:pathParam1/r2/:pathParam2', {
          defaultRouteParams: {
            queryParams: { optional3: 'default' },
          },
        });

        expect(
          RouteDefinition.toUrl(route, {
            pathParams: { pathParam1: 'a', pathParam2: 'b' },
            queryParams: {
              optional3: 'overridden',
              optional4: 'extra',
            },
          }),
        ).toEqual('/r1/a/r2/b?optional3=overridden&optional4=extra');
      });
    });

    describe('custom stringify function', () => {
      it('calls queryParamsStringify function with correct params', () => {
        const stringifySpy = jest.fn();
        const queryParams = { a: '1' };
        const route = RouteDefinition.build<{}, { a: string }>('/a', { queryParamsStringify: stringifySpy });
        RouteDefinition.toUrl(route, { queryParams });
        expect(stringifySpy).toBeCalledWith(queryParams);
      });

      it('uses queryParamsStringify return value for url construction', () => {
        const stringifySpy = () => 'query_params';
        const route = RouteDefinition.build<{}, { a: string }>('/a', { queryParamsStringify: stringifySpy });
        const url = RouteDefinition.toUrl(route, { queryParams: { a: '1' } });
        expect(url).toEqual('/a?query_params');
      });
    });
  });

  describe('join', () => {
    it('concatenates route definitions', () => {
      const r1 = RouteDefinition.build('/users');
      const r2 = RouteDefinition.build<{ userId: number }>('/:userId');
      const userDetailsRoute = RouteDefinition.join(r1, r2);
      expect(RouteDefinition.toPath(userDetailsRoute)).toEqual('/users/:userId');
    });

    it('concatenates route definitions having params constraints', () => {
      const r1 = RouteDefinition.build('/users');
      const r2 = RouteDefinition.build<{ userId: number }>('/:userId');
      const r3 = RouteDefinition.build('/items');
      const r4 = RouteDefinition.build<{ itemId: number }>('/:itemId');
      const userDetailsRoute = RouteDefinition.join(r1, r2, r3, r4);
      expect(RouteDefinition.toUrl(userDetailsRoute, { pathParams: { userId: 1, itemId: 2 } })).toEqual(
        '/users/1/items/2',
      );
    });
  });
});
