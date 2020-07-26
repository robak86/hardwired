import { serverDefinitions } from '@hardwired/server';
import { module } from '@hardwired/di-core';
import { commonDefines } from '@hardwired/di';
import { CorsMiddleware, CorsMiddlewareConfig } from './CorsMiddleware';

export const middlewaresModule = module('middlewares')
  .using(commonDefines)
  .value('corsConfig', { allowedHosts: '' } as CorsMiddlewareConfig)
  .using(serverDefinitions)
  .middleware('cors', CorsMiddleware, ctx => [ctx.corsConfig]);
