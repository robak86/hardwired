import { createQueryRoute, HttpMethod } from '@roro/s-middleware';

export type HelloWorldParams = { a: 'string' };
export type HelloWorldResponse = { message: string };

export const helloWorldRoute = createQueryRoute<HelloWorldParams, HelloWorldResponse>(
  HttpMethod.GET,
  '/hello',
).mapParams(['a'], []);
