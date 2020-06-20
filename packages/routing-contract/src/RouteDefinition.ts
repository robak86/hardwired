import { HttpMethod } from './HttpMethod';

export type RouteDefinition<TPayload extends object, TReturn extends object> = {
  pathDefinition: string;
  httpMethod: HttpMethod;
};

export const RouteDefinition = {
  empty(): RouteDefinition<any, any> {
    return { pathDefinition: '__never', httpMethod: HttpMethod.POST };
  },
};

