import { Middleware, HttpResponse, MiddlewareResult } from '@roro/s-middleware';

export type CorsMiddlewareConfig = {
  allowedHosts: string;
};

export class CorsMiddleware implements Middleware {
  constructor(private config: CorsMiddlewareConfig) {}

  run(response): MiddlewareResult {
    return {
      ...response,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
}