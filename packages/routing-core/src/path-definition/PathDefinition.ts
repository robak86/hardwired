import { compilePathDefinition } from './compilePathDefinition';
import { match } from 'path-to-regexp';

export type PathDefinition<TPathParams extends object> = {
  pathDefinition: string;
};

export type MappablePathDefinition<TPathParams extends object> = PathDefinition<TPathParams> & {
  pathParams: Array<keyof TPathParams>;
};

export const PathDefinition = {
  buildMappable<TPathParams extends object>(
    pathDefinition: string,
    pathParams: Array<keyof TPathParams>,
  ): MappablePathDefinition<TPathParams> {
    return { pathDefinition, pathParams };
  },

  build<TPathParams extends object>(pathDefinition: string): PathDefinition<TPathParams> {
    return { pathDefinition };
  },

  match<TPathParams extends object>(routeDefinition: PathDefinition<TPathParams>, url: string): boolean {
    const matchFn = match(routeDefinition.pathDefinition, { decode: decodeURIComponent });
    const matched = matchFn(url);
    return !!matched;

    // const { params: pathParams } = matched;
    // const queryParams = queryParamsImpl.parse(url);
    //
    // return { matched: true, pathParams, queryParams };
  },

  toUrl<TPathParams extends object>(params: TPathParams, { pathDefinition }: PathDefinition<TPathParams>): string {
    const compiled = compilePathDefinition(pathDefinition);
    return compiled(params);
  },
};
