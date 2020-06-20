export type HttpRequest = {
  request: string;
};

export type HttpResponse<T> = {
  data: T;
};

export type HttpMethod = any;

export interface IMiddleware<TOutput> {
  run(): TOutput | Promise<TOutput>;
}

/**
 * This class is returned by the container and encapsulates all the wiring. It requires as an input http request object
 */
export type ContainerHandler<TReturn extends object> = {
  request(request: HttpRequest): HttpResponse<TReturn> | Promise<HttpResponse<TReturn>>;
  httpMethod: HttpMethod;
  pathDefinition: string;
};

export type RouteDefinition<TPayload extends object, TReturn extends object> = {
  pathDefinition: string;
  httpMethod: HttpMethod;
};

export const RouteDefinition = {
  empty(): RouteDefinition<any, any> {
    return { pathDefinition: '__never', httpMethod: 'post' };
  },
};
