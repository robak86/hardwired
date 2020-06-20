export type HttpRequest = {
  request: string;
};

export type HttpMethod = any;

export interface IMiddleware<TOutput> {
  run(): TOutput | Promise<TOutput>;
}

/**
 * This class is returned by the container and encapsulates all the wiring. It requires as an input http request object
 */
export type ContainerHandler<TReturn extends object> = {
  request(request: HttpRequest): TReturn | Promise<TReturn>;
  pathDefinition: string;
};

export type RouteDefinition<TPayload extends object, TReturn extends object> = {};
