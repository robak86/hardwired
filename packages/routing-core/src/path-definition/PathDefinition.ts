import { compilePathDefinition } from './compilePathDefinition';
import { match } from 'path-to-regexp';
import { UnionToIntersection } from 'utility-types';

export type PathDefinition<TPathParams extends object> = {
  readonly pathDefinition: string;
};

export type MappablePathDefinition<TPathParams extends object> = PathDefinition<TPathParams> & {
  readonly pathParams: Array<keyof TPathParams>;
};

// export class PathD<TPathParams extends object>
//   implements PathDefinition<TPathParams>, MappablePathDefinition<TPathParams> {
//   constructor(readonly pathDefinition: string, readonly pathParams: Array<keyof TPathParams>) {}
//
//   match(url: string): boolean {
//     const matchFn = match(this.pathDefinition, { decode: decodeURIComponent });
//     const matched = matchFn(url);
//     return !!matched;
//
//     // const { params: pathParams } = matched;
//     // const queryParams = queryParamsImpl.parse(url);
//     //
//     // return { matched: true, pathParams, queryParams };
//   }
//
//   toUrl(params: TPathParams): string {
//     const compiled = compilePathDefinition(this.pathDefinition);
//     return compiled(params);
//   }
// }

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
